from __future__ import annotations
import time
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass
from config import (
    WEB_SEARCH_BACKEND, WEB_SEARCH_FALLBACK, SERPER_API_KEY,
    WEB_SEARCH_TIMEOUT, WEB_SEARCH_MAX_RESULTS, WEB_SEARCH_COOLDOWN,
    WEB_SEARCH_CACHE_TTL, WEB_SEARCH_FAIL_THRESHOLD,
)

logger = logging.getLogger(__name__)


@dataclass
class SearchResult:
    title: str
    url: str
    snippet: str


class SearchBackend(ABC):
    @abstractmethod
    async def search(self, query: str) -> list[SearchResult]:
        ...


class DuckDuckGoBackend(SearchBackend):
    async def search(self, query: str) -> list[SearchResult]:
        import asyncio
        from duckduckgo_search import DDGS

        def _sync_search():
            return list(DDGS().text(query, max_results=WEB_SEARCH_MAX_RESULTS))

        results = await asyncio.to_thread(_sync_search)
        return [
            SearchResult(
                title=r.get("title", ""),
                url=r.get("href", ""),
                snippet=r.get("body", ""),
            )
            for r in results
        ]


class SerperBackend(SearchBackend):
    async def search(self, query: str) -> list[SearchResult]:
        import httpx

        if not SERPER_API_KEY:
            raise RuntimeError("SERPER_API_KEY 未配置")

        async with httpx.AsyncClient(timeout=WEB_SEARCH_TIMEOUT) as client:
            resp = await client.post(
                "https://google.serper.dev/search",
                json={"q": query, "num": WEB_SEARCH_MAX_RESULTS},
                headers={"X-API-KEY": SERPER_API_KEY},
            )
            resp.raise_for_status()
            data = resp.json()
            return [
                SearchResult(
                    title=r.get("title", ""),
                    url=r.get("link", ""),
                    snippet=r.get("snippet", ""),
                )
                for r in data.get("organic", [])
            ]


class SearchManager:
    """管理搜索后端，处理缓存、冷却、故障切换。"""

    def __init__(self):
        self._backend_name = WEB_SEARCH_BACKEND
        self._fallback_name = WEB_SEARCH_FALLBACK
        self._backend = self._create_backend(self._backend_name)
        self._last_search_time = 0.0
        self._fail_count = 0
        self._cache: dict[str, tuple[float, list[SearchResult]]] = {}
        self._max_cache_size = 100
        self._fallback_active = False

    def _create_backend(self, name: str) -> SearchBackend:
        if name == "duckduckgo":
            return DuckDuckGoBackend()
        elif name == "serper":
            return SerperBackend()
        else:
            raise ValueError(f"未知搜索后端: {name}")

    async def search(self, query: str) -> list[SearchResult]:
        # 冷却检查
        elapsed = time.time() - self._last_search_time
        if elapsed < WEB_SEARCH_COOLDOWN:
            wait = WEB_SEARCH_COOLDOWN - elapsed
            raise RuntimeError(f"请稍后再试（两次搜索需间隔 {WEB_SEARCH_COOLDOWN} 秒以上，请等待 {wait:.0f} 秒）")

        # 缓存检查
        cache_key = query.strip().lower()
        if cache_key in self._cache:
            cached_at, cached_results = self._cache[cache_key]
            if time.time() - cached_at < WEB_SEARCH_CACHE_TTL:
                logger.info(f"搜索命中缓存: {query}")
                return cached_results

        # 执行搜索
        try:
            results = await self._backend.search(query)
            self._last_search_time = time.time()
            self._fail_count = 0
            # 缓存淘汰：超过上限时删除最旧的条目
            if len(self._cache) >= self._max_cache_size:
                oldest_key = min(self._cache, key=lambda k: self._cache[k][0])
                del self._cache[oldest_key]
            self._cache[cache_key] = (time.time(), results)
            return results
        except Exception as e:
            logger.warning(f"搜索后端 {self._backend_name} 失败: {e}")
            self._fail_count += 1

            if self._fail_count >= WEB_SEARCH_FAIL_THRESHOLD and not self._fallback_active:
                logger.info(f"切换到备用后端: {self._fallback_name}")
                self._backend_name = self._fallback_name
                self._backend = self._create_backend(self._backend_name)
                self._fail_count = 0
                self._fallback_active = True
                return await self.search(query)

            raise RuntimeError(f"搜索服务暂时不可用: {e}")


_search_manager = SearchManager()


async def search_web(query: str) -> str:
    """执行联网搜索，返回格式化文本（供 Agent 注入 Prompt）。"""
    try:
        results = await _search_manager.search(query)
    except RuntimeError as e:
        return f"搜索失败：{e}"

    if not results:
        return "未找到相关结果。"

    lines = ["以下是与问题相关的网络搜索结果：\n"]
    for i, r in enumerate(results, 1):
        lines.append(f"{i}. **{r.title}**\n   {r.snippet}\n   来源: {r.url}\n")
    return "\n".join(lines)
