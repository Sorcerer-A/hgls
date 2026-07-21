from __future__ import annotations
import json
import sqlite3
import asyncio
import logging
from datetime import datetime, timedelta
from openai import AsyncOpenAI
from config import (
    DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL,
    MEMORY_DB_PATH, MEMORY_MAX_ROUNDS, MEMORY_SUMMARY_TRIGGER,
    MEMORY_TTL_DAYS, TEMPERATURE,
)

logger = logging.getLogger(__name__)

# asyncio 锁保护 SQLite 操作（FastAPI 单线程多协程，需要协程级并发控制）
_db_lock = asyncio.Lock()
_conn: sqlite3.Connection | None = None


def _get_conn() -> sqlite3.Connection:
    global _conn
    if _conn is None:
        import os
        os.makedirs("data", exist_ok=True)
        _conn = sqlite3.connect(MEMORY_DB_PATH, check_same_thread=False)
        _conn.execute("PRAGMA journal_mode=WAL")
        _conn.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                session_id TEXT PRIMARY KEY,
                messages_json TEXT NOT NULL DEFAULT '[]',
                summary_text TEXT NOT NULL DEFAULT '',
                file_text TEXT NOT NULL DEFAULT '',
                file_name TEXT NOT NULL DEFAULT '',
                active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        _conn.commit()
    return _conn


async def _db_execute(sql: str, params: tuple = ()) -> sqlite3.Cursor:
    """在锁保护下执行 SQL。"""
    async with _db_lock:
        conn = _get_conn()
        cursor = conn.execute(sql, params)
        conn.commit()
        return cursor


async def _db_fetchone(sql: str, params: tuple = ()) -> tuple | None:
    async with _db_lock:
        conn = _get_conn()
        return conn.execute(sql, params).fetchone()


class MemoryManager:
    """管理单个会话的对话记忆。所有 DB 操作通过 _db_execute/_db_fetchone 串行化。"""

    def __init__(self, session_id: str):
        self.session_id = session_id

    async def _ensure_session(self):
        now = datetime.utcnow().isoformat()
        await _db_execute(
            """INSERT OR IGNORE INTO sessions (session_id, messages_json, summary_text, active, created_at, updated_at)
               VALUES (?, '[]', '', 1, ?, ?)""",
            (self.session_id, now, now),
        )

    async def get_messages(self) -> list[dict]:
        row = await _db_fetchone(
            "SELECT messages_json FROM sessions WHERE session_id=? AND active=1",
            (self.session_id,),
        )
        if not row:
            return []
        return json.loads(row[0])

    async def get_summary(self) -> str:
        row = await _db_fetchone(
            "SELECT summary_text FROM sessions WHERE session_id=? AND active=1",
            (self.session_id,),
        )
        return row[0] if row else ""

    async def add_exchange(self, user_msg: str, assistant_msg: str):
        await self._ensure_session()
        messages = await self.get_messages()
        messages.append({"role": "user", "content": user_msg})
        messages.append({"role": "assistant", "content": assistant_msg})

        now = datetime.utcnow().isoformat()
        await _db_execute(
            "UPDATE sessions SET messages_json=?, updated_at=? WHERE session_id=? AND active=1",
            (json.dumps(messages, ensure_ascii=False), now, self.session_id),
        )

        # 触发异步压缩
        rounds = len(messages) // 2
        if rounds > MEMORY_SUMMARY_TRIGGER:
            asyncio.create_task(self._compress_async())

    async def _compress_async(self):
        """异步后台压缩，从数据库重新读取最新状态避免竞态条件。"""
        try:
            # 从数据库读取最新消息（而非使用调用时的快照）
            messages = await self.get_messages()
            if len(messages) // 2 <= MEMORY_SUMMARY_TRIGGER:
                return  # 已被其他协程压缩过了

            old_messages = messages[:10]  # 最早 5 轮 = 10 条
            client = AsyncOpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL)
            compress_prompt = "请将以下对话历史压缩为 1-2 句话的摘要，保留关键信息：\n\n"
            for m in old_messages:
                compress_prompt += f"[{m['role']}]: {m['content']}\n"

            resp = await client.chat.completions.create(
                model=DEEPSEEK_MODEL,
                messages=[{"role": "user", "content": compress_prompt}],
                max_tokens=200,
                temperature=0.3,
            )
            new_summary = resp.choices[0].message.content or ""

            # 合并摘要
            old_summary = await self.get_summary()
            combined = f"{old_summary}\n{new_summary}".strip()

            # 裁剪消息（再次读取确保没有新消息插入）
            latest_messages = await self.get_messages()
            trimmed = latest_messages[10:] if len(latest_messages) > 10 else latest_messages

            now = datetime.utcnow().isoformat()
            await _db_execute(
                "UPDATE sessions SET messages_json=?, summary_text=?, updated_at=? WHERE session_id=? AND active=1",
                (json.dumps(trimmed, ensure_ascii=False), combined, now, self.session_id),
            )
            logger.info(f"会话 {self.session_id[:8]} 记忆压缩完成")
        except Exception as e:
            logger.warning(f"后台压缩失败: {e}")

    async def clear(self):
        await _db_execute(
            "UPDATE sessions SET active=0, updated_at=? WHERE session_id=?",
            (datetime.utcnow().isoformat(), self.session_id),
        )

    @staticmethod
    async def cleanup_old():
        """清理超过 TTL 的非活跃会话。"""
        cutoff = (datetime.utcnow() - timedelta(days=MEMORY_TTL_DAYS)).isoformat()
        await _db_execute("DELETE FROM sessions WHERE active=0 AND updated_at < ?", (cutoff,))
