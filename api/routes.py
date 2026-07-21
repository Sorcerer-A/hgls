import json
import uuid
import logging
from fastapi import APIRouter
from fastapi.responses import StreamingResponse, HTMLResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional

logger = logging.getLogger(__name__)
router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: str
    force_tool: Optional[str] = None


# 会话级缓存（暂存上传的文件文本）
session_files: dict[str, str] = {}


@router.get("/")
async def index():
    with open("static/index.html", encoding="utf-8") as f:
        return HTMLResponse(f.read())


@router.post("/chat")
async def chat(req: ChatRequest):
    """SSE 流式对话端点。骨架阶段：直接对话，暂不涉及工具调用。"""

    async def generate():
        from openai import AsyncOpenAI
        from config import (
            DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL,
            MAX_OUTPUT_TOKENS, TEMPERATURE, SYSTEM_PROMPT,
        )

        client = AsyncOpenAI(
            api_key=DEEPSEEK_API_KEY,
            base_url=DEEPSEEK_BASE_URL,
        )

        try:
            stream = await client.chat.completions.create(
                model=DEEPSEEK_MODEL,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": req.message},
                ],
                max_tokens=MAX_OUTPUT_TOKENS,
                temperature=TEMPERATURE,
                stream=True,
            )

            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    data = json.dumps(
                        {"content": chunk.choices[0].delta.content},
                        ensure_ascii=False,
                    )
                    yield f"data: {data}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            logger.error(f"API 调用失败: {e}")
            yield f"data: {json.dumps({'error': '服务暂时不可用，请稍后重试'}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
