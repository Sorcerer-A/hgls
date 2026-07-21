import os
import logging
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from api.routes import router
from config import DEEPSEEK_API_KEY

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# 启动检查
if not DEEPSEEK_API_KEY:
    logger.error("DEEPSEEK_API_KEY 未设置！请在 .env 文件中配置后重试。")
    logger.error("  cp .env.example .env")
    logger.error("  编辑 .env 填入你的 API Key")
    raise SystemExit(1)

os.makedirs("data", exist_ok=True)

app = FastAPI(title="OfficeAI 助手", version="0.1.0")

app.include_router(router)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.on_event("startup")
async def startup():
    from agent.memory import MemoryManager
    await MemoryManager.cleanup_old()
    logger.info("OfficeAI 助手已启动: http://localhost:8000")


@app.on_event("shutdown")
async def shutdown():
    from agent.memory import _conn
    if _conn:
        _conn.close()
    logger.info("OfficeAI 助手已关闭")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
