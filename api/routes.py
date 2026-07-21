from __future__ import annotations
import os
import json
import uuid
import shutil
import logging
from datetime import datetime as dt
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import StreamingResponse, HTMLResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional
from config import SYSTEM_PROMPT, MEMORY_MAX_ROUNDS

logger = logging.getLogger(__name__)
router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: str
    force_tool: Optional[str] = None


class ClearMemoryRequest(BaseModel):
    session_id: str


# 会话级缓存（暂存上传的文件文本，重启后从 SQLite 恢复）
session_files: dict[str, str] = {}


@router.get("/")
async def index():
    with open("static/index.html", encoding="utf-8") as f:
        return HTMLResponse(f.read())


@router.post("/upload")
async def upload_file(file: UploadFile = File(...), session_id: str = Form("")):
    """上传文件，解析后返回文本预览。session_id 用于关联会话。"""
    from tools.doc_parser import parse_document, ParseError

    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ["txt", "docx", "md", "pdf"]:
        return JSONResponse(
            {"error": f"不支持的格式 .{ext}。支持：txt, docx, md, pdf"},
            status_code=400,
        )

    os.makedirs("data/uploads", exist_ok=True)
    file_path = f"data/uploads/{uuid.uuid4().hex}_{file.filename}"

    try:
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        text = await parse_document(file_path, file.filename)
        preview = text[:500]

        # 持久化到 SQLite（按 session_id 存储，重启不丢失）
        if session_id:
            from agent.memory import _db_execute
            await _db_execute(
                "UPDATE sessions SET file_text=?, file_name=?, updated_at=? WHERE session_id=? AND active=1",
                (text, file.filename, dt.utcnow().isoformat(), session_id),
            )
            # 同时更新内存缓存
            session_files[session_id] = text

        return JSONResponse({
            "filename": file.filename,
            "preview": preview,
            "full_length": len(text),
            "message": f"已解析 {file.filename}（共 {len(text)} 字符）",
        })
    except ParseError as e:
        return JSONResponse({"error": str(e)}, status_code=400)
    except Exception as e:
        logger.error(f"文件上传失败: {e}")
        return JSONResponse({"error": "文件处理失败，请重试"}, status_code=500)


@router.get("/templates")
async def list_templates():
    """返回可用文案模板列表"""
    from config import TEMPLATES
    return JSONResponse(TEMPLATES)


@router.post("/chat")
async def chat(req: ChatRequest):
    """SSE 流式对话端点，支持 Function Calling 工具调度和记忆"""
    from agent.core import chat_with_tools
    from agent.memory import MemoryManager

    memory = MemoryManager(req.session_id)
    await memory._ensure_session()
    history = await memory.get_messages()

    # 构建带摘要的系统消息
    summary = await memory.get_summary()
    system_with_context = SYSTEM_PROMPT
    if summary:
        system_with_context = SYSTEM_PROMPT + f"\n\n## 之前的对话摘要\n{summary}"

    # 限制最近 N 轮
    max_msgs = MEMORY_MAX_ROUNDS * 2
    if len(history) > max_msgs:
        history = history[-max_msgs:]

    async def generate():
        full_response = ""
        try:
            async for sse_data in chat_with_tools(
                message=req.message,
                history=history,
                force_tool=req.force_tool,
                session_files=session_files,
                session_id=req.session_id,
                system_prompt=system_with_context,
            ):
                try:
                    data_str = sse_data.replace("data: ", "", 1)
                    if data_str.startswith("[DONE]"):
                        continue
                    parsed = json.loads(data_str)
                    if parsed.get("content"):
                        full_response += parsed["content"]
                except Exception:
                    pass
                yield sse_data

            if full_response.strip():
                await memory.add_exchange(req.message, full_response)
        except Exception as e:
            logger.error(f"Chat 端点异常: {e}")
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


@router.post("/clear-memory")
async def clear_memory(req: ClearMemoryRequest):
    """清除指定会话的记忆"""
    from agent.memory import MemoryManager
    memory = MemoryManager(req.session_id)
    await memory.clear()
    return JSONResponse({"message": "会话记忆已清除"})


class SettingsRequest(BaseModel):
    api_base: str = ""
    api_key: str = ""
    model: str = ""
    theme: str = "amber"


@router.get("/settings")
async def get_user_settings():
    """读取用户设置"""
    from agent.memory import get_settings
    return JSONResponse(await get_settings())


@router.post("/settings")
async def save_user_settings(req: SettingsRequest):
    """保存用户设置（API 配置 + 主题）"""
    from agent.memory import save_settings
    settings = {
        "api_base": req.api_base,
        "api_key": req.api_key,
        "model": req.model,
        "theme": req.theme,
    }
    await save_settings(settings)
    return JSONResponse({"message": "设置已保存", "theme": req.theme})
