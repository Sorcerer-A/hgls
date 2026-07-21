from __future__ import annotations
import json
import asyncio
import logging
from openai import AsyncOpenAI
from config import (
    DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL,
    MAX_OUTPUT_TOKENS, TEMPERATURE, SYSTEM_PROMPT, MAX_RETRIES,
    RETRY_BASE_DELAY, REQUEST_TIMEOUT,
)
from tools.doc_generator import generate_prompt

logger = logging.getLogger(__name__)

# ── Function Definitions ──────────────────────────────────────────

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "summarize_document",
            "description": "总结当前会话中已上传的文档，提取摘要和关键要点。文档内容由系统自动从已上传文件中读取，无需传入。",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "generate_document",
            "description": "按模板生成文案（周报/会议纪要/工作通知）",
            "parameters": {
                "type": "object",
                "properties": {
                    "template_key": {
                        "type": "string",
                        "enum": ["weekly_report", "meeting_minutes", "work_notice"],
                        "description": "模板标识",
                    },
                    "fields": {
                        "type": "object",
                        "description": "用户填写的字段值，键名为字段名，值为字段内容",
                    },
                },
                "required": ["template_key", "fields"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "联网搜索实时信息，用于回答需要最新数据的问题",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "搜索关键词",
                    },
                },
                "required": ["query"],
            },
        },
    },
]

# ── Tool Executor ──────────────────────────────────────────────────

async def execute_tool(tool_name: str, arguments: dict, session_files: dict[str, str], session_id: str) -> str:
    """执行工具并返回结果字符串。"""
    if tool_name == "summarize_document":
        # 先从内存缓存读取，miss 时从 SQLite 读取（重启恢复）
        text = session_files.get(session_id, "")
        if not text:
            from agent.memory import _db_fetchone
            row = await _db_fetchone(
                "SELECT file_text FROM sessions WHERE session_id=? AND active=1",
                (session_id,),
            )
            if row and row[0]:
                text = row[0]
                session_files[session_id] = text  # 回填缓存
        if not text:
            return "错误：未找到已上传的文档内容。请先上传文档后再发起总结请求。"
        return f"文档内容如下（共 {len(text)} 字符）：\n\n{text}\n\n请基于以上内容进行总结。"

    elif tool_name == "generate_document":
        template_key = arguments.get("template_key", "")
        fields = arguments.get("fields", {})
        prompt = generate_prompt(template_key, fields)
        return f"请根据以下模板要求生成文案：\n\n{prompt}"

    elif tool_name == "search_web":
        query = arguments.get("query", "")
        from tools.web_search import search_web
        return await search_web(query)

    return f"未知工具: {tool_name}"


# ── Agent ──────────────────────────────────────────────────────────

async def chat_with_tools(
    message: str,
    history: list[dict],
    force_tool: str | None,
    session_files: dict[str, str],
    session_id: str,
    system_prompt: str = SYSTEM_PROMPT,
):
    """流式对话（含 Function Calling）。返回 async generator of SSE data strings。"""

    # ── 强制工具选择的边界检查 ──
    if force_tool == "doc_summary":
        has_file = session_id in session_files and session_files[session_id]
        if not has_file:
            yield f"data: {json.dumps({'content': '请先上传需要总结的文档，然后再发起总结请求。'}, ensure_ascii=False)}\n\n"
            yield "data: [DONE]\n\n"
            return

    if force_tool == "doc_generate":
        if "模板" not in message and "周报" not in message and "会议" not in message and "通知" not in message:
            yield f"data: {json.dumps({'content': '请先选择文案模板（周报/会议纪要/工作通知），并提供关键信息。'}, ensure_ascii=False)}\n\n"
            yield "data: [DONE]\n\n"
            return

    client = AsyncOpenAI(
        api_key=DEEPSEEK_API_KEY,
        base_url=DEEPSEEK_BASE_URL,
        timeout=REQUEST_TIMEOUT,
    )

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append({"role": "user", "content": message})

    # 决定 tools 参数
    tools_param = TOOLS
    if force_tool:
        tool_map = {
            "doc_summary": "summarize_document",
            "doc_generate": "generate_document",
            "web_search": "search_web",
        }
        target_tool = tool_map.get(force_tool)
        if target_tool:
            tools_param = [t for t in TOOLS if t["function"]["name"] == target_tool]

    retry_count = 0

    while retry_count <= MAX_RETRIES:
        try:
            # 第一次调用：让模型决定是否调用工具
            response = await client.chat.completions.create(
                model=DEEPSEEK_MODEL,
                messages=messages,
                tools=tools_param,
                max_tokens=MAX_OUTPUT_TOKENS,
                temperature=TEMPERATURE,
            )

            choice = response.choices[0]

            # 如果模型要调用工具
            if choice.message.tool_calls:
                tool_call = choice.message.tool_calls[0]
                tool_name = tool_call.function.name
                arguments = json.loads(tool_call.function.arguments)

                yield f"data: {json.dumps({'status': f'正在执行: {tool_name}'}, ensure_ascii=False)}\n\n"

                tool_result = await execute_tool(tool_name, arguments, session_files, session_id)

                # 将工具结果回传模型
                messages.append({"role": "assistant", "tool_calls": [tool_call.model_dump()]})
                messages.append({"role": "tool", "tool_call_id": tool_call.id, "content": tool_result})

                # 第二次调用：模型基于工具结果生成最终回复
                stream = await client.chat.completions.create(
                    model=DEEPSEEK_MODEL,
                    messages=messages,
                    max_tokens=MAX_OUTPUT_TOKENS,
                    temperature=TEMPERATURE,
                    stream=True,
                )

                async for chunk in stream:
                    if chunk.choices[0].delta.content:
                        yield f"data: {json.dumps({'content': chunk.choices[0].delta.content}, ensure_ascii=False)}\n\n"

            else:
                # 无工具调用，重新以流模式调用保证流式体验一致
                stream = await client.chat.completions.create(
                    model=DEEPSEEK_MODEL,
                    messages=messages,
                    max_tokens=MAX_OUTPUT_TOKENS,
                    temperature=TEMPERATURE,
                    stream=True,
                )
                async for chunk in stream:
                    if chunk.choices[0].delta.content:
                        yield f"data: {json.dumps({'content': chunk.choices[0].delta.content}, ensure_ascii=False)}\n\n"

            yield "data: [DONE]\n\n"
            return

        except Exception as e:
            error_str = str(e).lower()
            # 不可重试错误
            if "401" in error_str or "403" in error_str or "invalid" in error_str:
                yield f"data: {json.dumps({'error': 'API Key 无效，请检查配置'}, ensure_ascii=False)}\n\n"
                return
            if "400" in error_str:
                yield f"data: {json.dumps({'error': '请求参数有误，请重试'}, ensure_ascii=False)}\n\n"
                return

            # 可重试错误
            retry_count += 1
            if retry_count <= MAX_RETRIES:
                delay = RETRY_BASE_DELAY * (2 ** (retry_count - 1))
                logger.warning(f"API 调用失败，{delay}s 后重试 ({retry_count}/{MAX_RETRIES}): {e}")
                await asyncio.sleep(delay)
            else:
                logger.error(f"API 调用全部重试失败: {e}")
                yield f"data: {json.dumps({'error': '服务暂时不可用，请稍后重试'}, ensure_ascii=False)}\n\n"
                return
