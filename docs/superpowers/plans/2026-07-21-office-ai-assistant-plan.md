# 轻量企业办公 AI 助手 Agent — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个基于 FastAPI + DeepSeek V4 的轻量企业办公 AI 助手，支持文档总结、文案生成、联网检索三大工具，提供聊天式 Web 界面。

**Architecture:** FastAPI 单服务架构，SSE 流式输出，前端原生 HTML/CSS/JS 无构建步骤。Agent 核心通过 OpenAI-compatible Function Calling 调度工具。SQLite 持久化会话记忆。搜索采用策略模式（DDG 默认 + Serper 备用）。

**Tech Stack:** Python 3.10+ / FastAPI / DeepSeek V4 (OpenAI SDK) / SQLite / HTML+CSS+JS (vanilla) / Jinja2

---

## 文件映射

| 文件 | 职责 | 阶段 |
|------|------|------|
| `requirements.txt` | 依赖清单 | P0 |
| `.env.example` | 环境变量模板 | P0 |
| `.gitignore` | Git 忽略规则 | P0 |
| `config.py` | 集中配置，从环境变量读取 | P0 |
| `app.py` | FastAPI 入口，挂载路由和静态文件 | P0 |
| `api/__init__.py` | 包初始化 | P0 |
| `api/routes.py` | API 路由（/chat /upload /templates /clear-memory） | P0-P2 |
| `agent/__init__.py` | 包初始化 | P0 |
| `agent/core.py` | Agent 核心：对话管理 + Function Calling + SSE | P0-P1 |
| `agent/memory.py` | 记忆系统：滑动窗口 + 摘要压缩 + SQLite | P2 |
| `tools/__init__.py` | 包初始化 | P1 |
| `tools/doc_parser.py` | 文档解析器（txt/docx/md/pdf） | P1 |
| `tools/doc_generator.py` | 文案生成器（Jinja2 模板） | P1 |
| `tools/web_search.py` | 联网检索（策略模式） | P1 |
| `templates/weekly_report.j2` | 周报 Jinja2 模板 | P1 |
| `templates/meeting_minutes.j2` | 会议纪要 Jinja2 模板 | P1 |
| `templates/work_notice.j2` | 工作通知 Jinja2 模板 | P1 |
| `static/index.html` | 前端页面结构 | P0 (骨架) → P3 (完稿) |
| `static/style.css` | 前端样式 | P0 (骨架) → P3 (完稿) |
| `static/app.js` | 前端交互逻辑 | P0 (骨架) → P3 (完稿) |

---

## Phase 0：项目骨架 + 基础对话（目标：能聊天）

### Task 0.1: 创建项目骨架

**Files:**
- Create: `requirements.txt`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `config.py`
- Create: `agent/__init__.py`
- Create: `tools/__init__.py`
- Create: `api/__init__.py`

- [ ] **Step 1: 编写 requirements.txt**

```txt
fastapi>=0.110.0
uvicorn[standard]>=0.29.0
openai>=1.30.0
python-docx>=1.1.0
pdfplumber>=0.10.0
jinja2>=3.1.0
httpx>=0.27.0
duckduckgo-search>=6.0.0
python-multipart>=0.0.9
markdown>=3.6.0
python-dotenv>=1.0.0
```

- [ ] **Step 2: 安装依赖**

```bash
pip install -r requirements.txt
```

- [ ] **Step 3: 编写 .gitignore**

```
.env
data/
__pycache__/
*.pyc
```

- [ ] **Step 4: 编写 .env.example**

```
DEEPSEEK_API_KEY=sk-your-key-here
SERPER_API_KEY=
```

- [ ] **Step 5: 编写 config.py**

```python
import os
from dotenv import load_dotenv

load_dotenv()

# DeepSeek
DEEPSEEK_API_KEY = os.environ["DEEPSEEK_API_KEY"]
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")

# 输出控制
MAX_OUTPUT_TOKENS = 4096
TEMPERATURE = 0.7

# 记忆
MEMORY_MAX_ROUNDS = 10
MEMORY_SUMMARY_TRIGGER = 10
MEMORY_DB_PATH = "data/sessions.db"
MEMORY_TTL_DAYS = 7

# 文件上传
MAX_FILE_SIZE_MB = 5
MAX_PDF_PAGES = 100
PARSE_TIMEOUT_SEC = 30
ALLOWED_EXTENSIONS = ["txt", "docx", "md", "pdf"]

# API 重试
MAX_RETRIES = 3
RETRY_BASE_DELAY = 1.0
REQUEST_TIMEOUT = 30

# 联网检索
WEB_SEARCH_BACKEND = "duckduckgo"
WEB_SEARCH_FALLBACK = "serper"
SERPER_API_KEY = os.getenv("SERPER_API_KEY", "")
WEB_SEARCH_TIMEOUT = 10
WEB_SEARCH_MAX_RESULTS = 5
WEB_SEARCH_COOLDOWN = 3
WEB_SEARCH_CACHE_TTL = 3600
WEB_SEARCH_FAIL_THRESHOLD = 3

# 模板注册
TEMPLATES = {
    "weekly_report": {
        "name": "周报",
        "description": "生成本周工作总结与下周计划",
        "fields": ["本周完成", "下周计划", "问题风险"],
    },
    "meeting_minutes": {
        "name": "会议纪要",
        "description": "整理会议讨论内容与决议",
        "fields": ["议题", "决议", "待办事项", "责任人"],
    },
    "work_notice": {
        "name": "工作通知",
        "description": "起草正式工作通知",
        "fields": ["通知对象", "事项内容", "时间", "要求"],
    },
}

# 系统提示词
SYSTEM_PROMPT = """你是一个企业办公 AI 助手，帮助用户处理文档、生成文案、检索信息。

你的能力包括：
1. 文档总结：对上传的文档提取摘要和关键要点
2. 文案生成：按模板生成周报、会议纪要、工作通知
3. 联网检索：实时查询信息并整合回答

请用简洁、专业的中文回复。当用户上传文档时，先确认已收到文件再进行分析。
当需要实时信息时，主动使用搜索工具。回答末尾可建议用户进一步的操作。"""
```

- [ ] **Step 6: 创建空的 __init__.py 文件**

```bash
mkdir -p agent tools api static data templates
touch agent/__init__.py tools/__init__.py api/__init__.py
```

- [ ] **Step 7: Commit**

```bash
git add requirements.txt .gitignore .env.example config.py agent/ tools/ api/ static/ templates/ data/
git commit -m "feat: create project skeleton with config and dependencies"
```

---

### Task 0.2: 创建 FastAPI 入口文件

**Files:**
- Create: `app.py`

- [ ] **Step 1: 编写 app.py**

```python
import os
import logging
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
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
    from agent.memory import cleanup_old
    await cleanup_old()
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
```

- [ ] **Step 2: 验证启动**

```bash
python app.py
# 预期输出: OfficeAI 助手已启动: http://localhost:8000
# Ctrl+C 停止
```

- [ ] **Step 3: Commit**

```bash
git add app.py
git commit -m "feat: add FastAPI entry point with startup check"
```

---

### Task 0.3: 创建 API 路由骨架 + 基础 /chat 端点

**Files:**
- Create: `api/routes.py`

- [ ] **Step 1: 编写 api/routes.py**

```python
import json
import uuid
import logging
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse, HTMLResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional

logger = logging.getLogger(__name__)
router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: str
    force_tool: Optional[str] = None


# 会话级缓存（任务中暂存上传的文件文本）
session_files: dict[str, str] = {}


@router.get("/")
async def index():
    with open("static/index.html", encoding="utf-8") as f:
        return HTMLResponse(f.read())


@router.post("/chat")
async def chat(req: ChatRequest):
    """SSE 流式对话端点。骨架阶段返回模拟流。"""
    async def generate():
        # 骨架阶段：直接调用 DeepSeek，暂不涉及工具
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
```

- [ ] **Step 2: 编写静态首页（暂时返回占位 HTML，防止 / 路由 404）**

在 `static/index.html` 中写入一个极简骨架（后续 P3 替换）:

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>OfficeAI 助手</title>
<link rel="stylesheet" href="/static/style.css">
</head>
<body>
<div id="app">
  <div id="chat-container">
    <div id="messages"></div>
    <div id="input-area">
      <textarea id="user-input" placeholder="输入消息... (Enter 发送, Shift+Enter 换行)" rows="2"></textarea>
      <button id="send-btn">发送</button>
    </div>
  </div>
</div>
<script src="/static/app.js"></script>
</body>
</html>
```

- [ ] **Step 3: 编写 style.css 骨架**

```css
:root { --bg: #1e1e2e; --surface: #313244; --text: #cdd6f4; --accent: #6c5ce7; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: var(--bg); color: var(--text); height: 100vh; display: flex; }
#app { flex: 1; display: flex; }
#chat-container { flex: 1; display: flex; flex-direction: column; max-width: 800px; margin: 0 auto; width: 100%; }
#messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
#input-area { display: flex; gap: 8px; padding: 16px; border-top: 1px solid var(--surface); }
#user-input { flex: 1; background: var(--surface); border: 1px solid #45475a; border-radius: 8px; padding: 10px; color: var(--text); resize: none; font-family: inherit; font-size: 14px; }
#send-btn { background: var(--accent); color: #fff; border: none; border-radius: 8px; padding: 10px 20px; cursor: pointer; font-size: 14px; font-weight: 600; }
#send-btn:hover { opacity: 0.9; }
.message { max-width: 75%; padding: 10px 14px; border-radius: 10px; font-size: 14px; line-height: 1.6; }
.message.user { align-self: flex-end; background: var(--accent); color: #fff; border-bottom-right-radius: 2px; }
.message.assistant { align-self: flex-start; background: var(--surface); color: var(--text); border-bottom-left-radius: 2px; }
</style>
```

- [ ] **Step 4: 编写 app.js 骨架**

```javascript
const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

const SESSION_ID = localStorage.getItem('officeai_session') || crypto.randomUUID();
localStorage.setItem('officeai_session', SESSION_ID);

function addMessage(role, text) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;
  inputEl.value = '';
  addMessage('user', text);

  const assistantDiv = addMessage('assistant', '');
  let fullText = '';

  try {
    const resp = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, session_id: SESSION_ID, force_tool: null }),
    });

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) { assistantDiv.textContent = parsed.error; return; }
            if (parsed.content) { fullText += parsed.content; assistantDiv.textContent = fullText; }
          } catch (e) { /* 忽略解析错误 */ }
        }
      }
    }
  } catch (e) {
    assistantDiv.textContent = '网络连接失败，请检查网络后重试。';
  }
}

sendBtn.addEventListener('click', sendMessage);
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
```

- [ ] **Step 5: 启动验证**

```bash
python app.py
# 打开 http://localhost:8000
# 输入 "你好" → 应看到 DeepSeek 流式回复
```

- [ ] **Step 6: Commit**

```bash
git add api/routes.py static/index.html static/style.css static/app.js
git commit -m "feat: add basic chat endpoint with SSE streaming and chat UI"
```

---

## Phase 1：三工具实现 + Function Calling（目标：能总结/生成/搜索）

### Task 1.1: 创建文档解析器

**Files:**
- Create: `tools/doc_parser.py`

- [ ] **Step 1: 编写 tools/doc_parser.py**

```python
import asyncio
import logging
from pathlib import Path
from config import MAX_FILE_SIZE_MB, MAX_PDF_PAGES, PARSE_TIMEOUT_SEC, ALLOWED_EXTENSIONS

logger = logging.getLogger(__name__)


class ParseError(Exception):
    """文档解析错误"""
    pass


async def parse_document(file_path: str, original_filename: str) -> str:
    """解析文档文件，返回纯文本内容。"""
    ext = Path(original_filename).suffix.lower().lstrip(".")

    if ext not in ALLOWED_EXTENSIONS:
        raise ParseError(
            f"不支持的文件格式 .{ext}。支持的格式：{', '.join(ALLOWED_EXTENSIONS)}"
        )

    file_size = Path(file_path).stat().st_size
    if file_size > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise ParseError(f"文件过大（上限 {MAX_FILE_SIZE_MB}MB），请压缩后重试")

    try:
        text = await asyncio.wait_for(
            _parse_by_ext(file_path, ext),
            timeout=PARSE_TIMEOUT_SEC,
        )
        return _truncate_if_needed(text)
    except asyncio.TimeoutError:
        raise ParseError("文档解析超时，文件可能过大或格式异常，请尝试分批处理")


async def _parse_by_ext(file_path: str, ext: str) -> str:
    if ext == "txt":
        return await _parse_txt(file_path)
    elif ext == "md":
        return await _parse_txt(file_path)
    elif ext == "docx":
        return await _parse_docx(file_path)
    elif ext == "pdf":
        return await _parse_pdf(file_path)
    else:
        raise ParseError(f"未实现的解析器: .{ext}")


async def _parse_txt(file_path: str) -> str:
    # 尝试 UTF-8，失败则 GBK
    for encoding in ["utf-8", "gbk", "gb2312"]:
        try:
            with open(file_path, encoding=encoding) as f:
                return f.read()
        except UnicodeDecodeError:
            continue
    raise ParseError("无法识别文件编码，请转换为 UTF-8 格式后重试")


async def _parse_docx(file_path: str) -> str:
    from docx import Document

    doc = Document(file_path)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n\n".join(paragraphs)


async def _parse_pdf(file_path: str) -> str:
    import pdfplumber

    with pdfplumber.open(file_path) as pdf:
        if len(pdf.pages) > MAX_PDF_PAGES:
            raise ParseError(
                f"PDF 页数超过上限（{MAX_PDF_PAGES}页），请分批上传"
            )
        texts = []
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                texts.append(page_text)
        return "\n\n".join(texts)


def _truncate_if_needed(text: str, max_chars: int = 30000) -> str:
    if len(text) > max_chars:
        return text[:max_chars] + "\n\n...（文档过长，已截取前 30000 字）"
    return text
```

- [ ] **Step 2: 验证解析器**

```python
# 在 Python REPL 中快速验证：
import asyncio
from tools.doc_parser import parse_document
# 创建测试文件
with open("/tmp/test.txt", "w") as f: f.write("Hello World 你好世界")
result = asyncio.run(parse_document("/tmp/test.txt", "test.txt"))
assert "Hello World" in result
print("OK:", result[:50])
```

- [ ] **Step 3: Commit**

```bash
git add tools/doc_parser.py
git commit -m "feat: add document parser supporting txt/docx/md/pdf with safety limits"
```

---

### Task 1.2: 添加文件上传端点

**Files:**
- Modify: `api/routes.py`（添加 /upload 端点）

- [ ] **Step 1: 在 api/routes.py 中添加导入和端点**

在文件顶部追加导入：
```python
import os
import shutil
from fastapi import UploadFile, File, Form
```

在 `@router.post("/chat")` 之前添加：
```python
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
        from datetime import datetime as dt
        from agent.memory import _db_execute
        if session_id:
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
```

- [ ] **Step 2: Commit**

```bash
git add api/routes.py
git commit -m "feat: add file upload endpoint with document parsing"
```

---

### Task 1.3: 创建文案生成器

**Files:**
- Create: `templates/weekly_report.j2`
- Create: `templates/meeting_minutes.j2`
- Create: `templates/work_notice.j2`
- Create: `tools/doc_generator.py`

- [ ] **Step 1: 编写 templates/weekly_report.j2**

```jinja2
请根据以下信息，生成一份格式规范的周报（Markdown 格式）：

## 本周工作总结

{{ fields.get('本周完成', '（待填写）') }}

## 下周工作计划

{{ fields.get('下周计划', '（待填写）') }}

## 问题与风险

{{ fields.get('问题风险', '无') }}

---
要求：
- 语言正式专业
- 每个条目使用分点列表
- 如有具体数据请保留
```

- [ ] **Step 2: 编写 templates/meeting_minutes.j2**

```jinja2
请根据以下信息，生成一份会议纪要（Markdown 格式）：

## 会议议题

{{ fields.get('议题', '（待填写）') }}

## 会议决议

{{ fields.get('决议', '（待填写）') }}

## 待办事项

{{ fields.get('待办事项', '（待填写）') }}

## 责任人及截止日期

{{ fields.get('责任人', '（待填写）') }}

---
要求：
- 待办事项用任务列表格式（- [ ]）
- 每条决议标明提出人
- 标注关键时间节点
```

- [ ] **Step 3: 编写 templates/work_notice.j2**

```jinja2
请根据以下信息，生成一份正式的工作通知（Markdown 格式）：

## 通知对象

{{ fields.get('通知对象', '全体员工') }}

## 事项内容

{{ fields.get('事项内容', '（待填写）') }}

## 时间与地点

{{ fields.get('时间', '（待填写）') }}

## 相关要求

{{ fields.get('要求', '（待填写）') }}

---
要求：
- 使用正式公文语气
- 关键信息（时间、地点）加粗
- 末尾加"特此通知"
```

- [ ] **Step 4: 编写 tools/doc_generator.py**

```python
import logging
from pathlib import Path
from jinja2 import Environment, FileSystemLoader

logger = logging.getLogger(__name__)

_templates_dir = Path(__file__).parent.parent / "templates"
_env = Environment(loader=FileSystemLoader(str(_templates_dir)))


def generate_prompt(template_key: str, fields: dict[str, str]) -> str:
    """根据模板 key 和用户填写的字段，渲染出完整的生成提示词。"""
    template = _env.get_template(f"{template_key}.j2")
    return template.render(fields=fields)


def get_template_info(template_key: str) -> dict:
    """获取模板的元信息（名称、描述、必填字段）。"""
    from config import TEMPLATES
    return TEMPLATES.get(template_key, {})
```

- [ ] **Step 5: Commit**

```bash
git add templates/ tools/doc_generator.py
git commit -m "feat: add document generator with 3 Jinja2 templates"
```

---

### Task 1.4: 添加模板列表端点

**Files:**
- Modify: `api/routes.py`（添加 GET /templates）

- [ ] **Step 1: 在 api/routes.py 中添加**

```python
@router.get("/templates")
async def list_templates():
    """返回可用文案模板列表"""
    from config import TEMPLATES
    return JSONResponse(TEMPLATES)
```

- [ ] **Step 2: Commit**

```bash
git add api/routes.py
git commit -m "feat: add GET /templates endpoint"
```

---

### Task 1.5: 创建联网检索工具

**Files:**
- Create: `tools/web_search.py`

- [ ] **Step 1: 编写 tools/web_search.py**

```python
import time
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
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
```

- [ ] **Step 2: Commit**

```bash
git add tools/web_search.py
git commit -m "feat: add web search with strategy pattern (DDG + Serper fallback)"
```

---

### Task 1.6: 集成 Function Calling 到 Agent 核心

**Files:**
- Create: `agent/core.py`

- [ ] **Step 1: 编写 agent/core.py**

```python
import json
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
    import asyncio

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
    last_error = None

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
                if choice.message.content:
                    # 如果模型直接返回了内容（非流式），重新以流模式获取
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
            last_error = e
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
```

- [ ] **Step 2: 更新 api/routes.py 的 /chat 端点**

将 `@router.post("/chat")` 中的生成函数替换为调用 `chat_with_tools`：

```python
@router.post("/chat")
async def chat(req: ChatRequest):
    """SSE 流式对话端点，支持 Function Calling 工具调度"""
    from agent.core import chat_with_tools

    async def generate():
        try:
            async for sse_data in chat_with_tools(
                message=req.message,
                history=[],  # P2 阶段替换为从 memory 读取
                force_tool=req.force_tool,
                session_files=session_files,
                session_id=req.session_id,
            ):
                yield sse_data
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
```

- [ ] **Step 3: Commit**

```bash
git add agent/core.py api/routes.py
git commit -m "feat: integrate Function Calling with 3 tool definitions"
```

---

## Phase 2：记忆系统 + 优化 + 异常处理（目标：有记忆、不崩溃）

### Task 2.1: 创建记忆系统

**Files:**
- Create: `agent/memory.py`

- [ ] **Step 1: 编写 agent/memory.py**

```python
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
```

- [ ] **Step 2: Commit**

```bash
git add agent/memory.py
git commit -m "feat: add memory system with SQLite persistence and async compression"
```

---

### Task 2.2: 将记忆集成到 /chat 端点 + 添加 /clear-memory

**Files:**
- Modify: `api/routes.py`（更新 /chat，添加 /clear-memory）

- [ ] **Step 1: 更新 /chat 端点以使用记忆**

在 `api/routes.py` 的 `chat()` 函数中，替换 `history=[]` 为从记忆读取：

```python
@router.post("/chat")
async def chat(req: ChatRequest):
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
```

需要补充导入：
```python
from config import SYSTEM_PROMPT, MEMORY_MAX_ROUNDS
from pydantic import BaseModel
from agent.memory import _db_execute, _db_fetchone
```

在 `ChatRequest` 类定义之后添加：
```python
class ClearMemoryRequest(BaseModel):
    session_id: str
```

- [ ] **Step 2: 添加 /clear-memory 端点**

```python
@router.post("/clear-memory")
async def clear_memory(req: ClearMemoryRequest):
    """清除指定会话的记忆"""
    from agent.memory import MemoryManager
    memory = MemoryManager(req.session_id)
    await memory.clear()
    return JSONResponse({"message": "会话记忆已清除"})
```

- [ ] **Step 3: Commit**

```bash
git add api/routes.py
git commit -m "feat: integrate memory into chat and add clear-memory endpoint"
```

---

### Task 2.3: 完善强制工具选择的边界处理

**Files:**
- Modify: `agent/core.py`（在 `chat_with_tools` 开头添加边界检查）

- [ ] **Step 1: 在 agent/core.py 的 chat_with_tools() 函数开头添加**

```python
async def chat_with_tools(
    message: str,
    history: list[dict],
    force_tool: str | None,
    session_files: dict[str, str],
    session_id: str,
):
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

    # ... 后续原有代码
```

- [ ] **Step 2: Commit**

```bash
git add agent/core.py
git commit -m "feat: add force_tool boundary checks"
```

---

### Task 2.4: 添加前端文件上传 UI 和强制工具选择

**Files:**
- Modify: `static/index.html`（添加侧边栏和上传区域）
- Modify: `static/app.js`（添加上传逻辑和工具切换）

- [ ] **Step 1: 更新 index.html 结构**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>OfficeAI 助手</title>
<link rel="stylesheet" href="/static/style.css">
</head>
<body>
<div id="app">
  <aside id="sidebar">
    <div id="sidebar-header">
      <h2>🤖 OfficeAI</h2>
    </div>
    <button id="new-chat-btn">+ 新对话</button>
    <nav id="tool-nav">
      <div class="nav-label">功能</div>
      <button class="tool-btn active" data-tool="">💬 自由对话</button>
      <button class="tool-btn" data-tool="doc_summary">📄 文档总结</button>
      <button class="tool-btn" data-tool="doc_generate">📝 文案生成</button>
      <button class="tool-btn" data-tool="web_search">🔍 联网检索</button>
    </nav>
    <div id="file-upload-area">
      <div class="nav-label">文件上传</div>
      <input type="file" id="file-input" accept=".txt,.docx,.md,.pdf" hidden>
      <button id="upload-btn">📎 选择文件</button>
      <div id="file-status"></div>
    </div>
    <div id="session-list"></div>
  </aside>
  <main id="chat-container">
    <div id="messages"></div>
    <div id="status-bar"></div>
    <div id="input-area">
      <textarea id="user-input" placeholder="输入消息... (Enter 发送, Shift+Enter 换行)" rows="2"></textarea>
      <button id="send-btn">发送</button>
    </div>
  </main>
</div>
<script src="/static/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: 更新 app.js 添加完整交互逻辑**

```javascript
const SESSION_ID = localStorage.getItem('officeai_session') || crypto.randomUUID();
localStorage.setItem('officeai_session', SESSION_ID);
let currentTool = null;
let uploadedFilename = null;

// DOM
const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const toolBtns = document.querySelectorAll('.tool-btn');
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const fileStatus = document.getElementById('file-status');
const statusBar = document.getElementById('status-bar');

// ── 消息渲染（每条消息自动带复制按钮）──
function addMessage(role, text) {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.innerHTML = renderMarkdown(text);
  wrapper.appendChild(div);

  // 每条 AI 消息自动带复制和下载按钮
  if (role === 'assistant' && text) {
    const btnGroup = document.createElement('div');
    btnGroup.className = 'msg-btns';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = '📋';
    copyBtn.title = '复制内容';
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = '✅';
        setTimeout(() => copyBtn.textContent = '📋', 2000);
      }).catch(() => { copyBtn.textContent = '❌'; });
    };

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'copy-btn';
    downloadBtn.textContent = '⬇️';
    downloadBtn.title = '下载为 .md';
    downloadBtn.onclick = () => {
      const blob = new Blob([text], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `officeai-${new Date().toISOString().slice(0,10)}.md`;
      a.click();
      URL.revokeObjectURL(url);
    };

    btnGroup.appendChild(copyBtn);
    btnGroup.appendChild(downloadBtn);
    wrapper.appendChild(btnGroup);
  }
  messagesEl.appendChild(wrapper);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

function renderMarkdown(text) {
  // 简单 Markdown 渲染（P3 替换为 marked.js）
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/^- (.+)$/gm, '• $1');
}

function setStatus(text) {
  statusBar.textContent = text;
  statusBar.style.display = text ? 'block' : 'none';
}

// ── 工具切换 ──
toolBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    toolBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTool = btn.dataset.tool || null;

    if (currentTool === 'doc_generate') {
      loadTemplates();
    }
  });
});

// ── 模板加载 ──
async function loadTemplates() {
  try {
    const resp = await fetch('/templates');
    const templates = await resp.json();
    if (currentTool === 'doc_generate') {
      let msg = '请选择模板并填写信息：\n\n';
      for (const [key, t] of Object.entries(templates)) {
        msg += `**${t.name}**（\`${key}\`）：${t.description}\n必填：${t.fields.join('、')}\n\n`;
      }
      addMessage('assistant', msg);
    }
  } catch (e) {
    console.error('加载模板失败:', e);
  }
}

// ── 文件上传（按钮 + 拖拽） ──
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileUpload);

// 拖拽上传
const dropZone = document.getElementById('chat-container');
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) uploadFile(file);
});

async function handleFileUpload() {
  const file = fileInput.files[0];
  if (file) uploadFile(file);
}

async function uploadFile(file) {
  if (file.size > 5 * 1024 * 1024) {
    fileStatus.textContent = '文件过大（上限 5MB）';
    return;
  }

  fileStatus.textContent = `上传中: ${file.name}...`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('session_id', SESSION_ID);

  try {
    const resp = await fetch('/upload', { method: 'POST', body: formData });
    const data = await resp.json();
    if (data.error) {
      fileStatus.textContent = data.error;
    } else {
      uploadedFilename = data.filename;
      fileStatus.textContent = `✅ ${data.filename}（${data.full_length} 字）`;
      addMessage('assistant', `已收到文件 **${data.filename}**（${data.full_length} 字符）。\n\n预览：\n> ${data.preview}...`);
    }
  } catch (e) {
    fileStatus.textContent = '上传失败，请重试';
  }
}

// ── 发送消息 ──
async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;
  inputEl.value = '';
  addMessage('user', text);

  const assistantDiv = addMessage('assistant', '');
  let fullText = '';

  try {
    const resp = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        session_id: SESSION_ID,
        force_tool: currentTool,
      }),
    });

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6);
        if (raw === '[DONE]') { setStatus(''); return; }
        try {
          const parsed = JSON.parse(raw);
          if (parsed.error) { assistantDiv.innerHTML = `<span class="error">${parsed.error}</span>`; return; }
          if (parsed.status) { setStatus(parsed.status); }
          if (parsed.content) { fullText += parsed.content; assistantDiv.innerHTML = renderMarkdown(fullText); }
        } catch (e) { /* skip */ }
      }
    }
  } catch (e) {
    if (fullText) {
      // 部分内容已接收，标记中断
      setStatus('⚠️ 连接中断，部分内容可能不完整');
      assistantDiv.innerHTML = renderMarkdown(fullText + '\n\n*（连接中断，请重试）*');
    } else {
      assistantDiv.innerHTML = '<span class="error">网络连接失败，请检查网络后重试。</span>';
    }
  }
}

// ── SSE 重连逻辑（fetch + 指数退避重试）──
let reconnectDelay = 1000;
const MAX_RECONNECT_DELAY = 30000;

async function sendMessageWithRetry(retryCount = 0) {
  try {
    await sendMessage();
    reconnectDelay = 1000; // 成功后重置
  } catch (e) {
    if (retryCount < 3) {
      setStatus(`连接中断，${Math.round(reconnectDelay/1000)}s 后重试...`);
      await new Promise(r => setTimeout(r, reconnectDelay));
      reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);
      await sendMessageWithRetry(retryCount + 1);
    }
  }
}

// ── 新对话 ──
newChatBtn.addEventListener('click', async () => {
  try {
    await fetch('/clear-memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: SESSION_ID }),
    });
  } catch (e) { /* 忽略 */ }
  // 生成新会话 ID 并持久化，避免幽灵会话
  const newId = crypto.randomUUID();
  localStorage.setItem('officeai_session', newId);
  location.reload();
});

// ── 快捷键 ──
sendBtn.addEventListener('click', sendMessage);
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

// ── 欢迎消息 ──
addMessage('assistant', '你好！我是 OfficeAI 助手。\n\n- 📄 上传文档，我来帮你总结\n- 📝 选择模板，生成周报/纪要/通知\n- 🔍 需要实时信息，我帮你搜索\n\n请选择功能或直接输入需求。');
```

- [ ] **Step 3: 更新 style.css 添加侧边栏样式**

```css
/* 侧边栏 */
#sidebar {
  width: 200px; background: #11111b; display: flex; flex-direction: column;
  padding: 16px 12px; gap: 10px; border-right: 1px solid #313244;
  overflow-y: auto; flex-shrink: 0;
}
#sidebar-header h2 { font-size: 15px; color: #cdd6f4; }
#new-chat-btn { background: #6c5ce7; color: #fff; border: none; border-radius: 6px; padding: 8px; cursor: pointer; font-size: 12px; font-weight: 600; }
#new-chat-btn:hover { opacity: 0.9; }
.nav-label { color: #585b70; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
.tool-btn { background: none; border: none; color: #a6adc8; text-align: left; padding: 8px 10px; border-radius: 6px; cursor: pointer; font-size: 13px; }
.tool-btn:hover { background: #313244; }
.tool-btn.active { background: #313244; color: #cdd6f4; font-weight: 600; border: 1px solid #6c5ce7; }
#file-upload-area { margin-top: auto; }
#upload-btn { background: #313244; color: #cdd6f4; border: 1px dashed #585b70; border-radius: 6px; padding: 8px; cursor: pointer; font-size: 12px; width: 100%; }
#file-status { font-size: 11px; color: #a6adc8; margin-top: 4px; word-break: break-all; }
#status-bar { display: none; text-align: center; padding: 6px; font-size: 11px; color: #a6adc8; background: #313244; }
.error { color: #f38ba8; }
```

- [ ] **Step 4: Commit**

```bash
git add static/index.html static/style.css static/app.js
git commit -m "feat: add sidebar, file upload UI, force tool selection, and keyboard shortcuts"
```

---

## Phase 3：界面打磨 + 响应式 + 动效（目标：精致交付）

### Task 3.1: 调用 frontend-design skill 完成独立视觉设计

**Files:**
- Modify: `static/style.css`（全部替换）
- Modify: `static/index.html`（微调结构以匹配设计）
- Modify: `static/app.js`（微调以匹配设计）

- [ ] **Step 1: 调用 frontend-design skill**

```bash
# 在实现时调用: Skill("frontend-design")
# 基于设计文档第 7 节的布局要求，设计非大众化配色的暗色主题
# 输出：全新的 style.css + 调整后的 index.html
```

- [ ] **Step 2: 集成 CDN 引入 Markdown 渲染库**

在 index.html `<head>` 中添加：
```html
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dompurify@3/dist/purify.min.js"></script>
```

更新 app.js 中的 `renderMarkdown()` 函数：
```javascript
function renderMarkdown(text) {
  if (typeof marked !== 'undefined') {
    const raw = marked.parse(text);
    // DOMPurify 防 XSS，允许 Markdown 常见标签
    return typeof DOMPurify !== 'undefined'
      ? DOMPurify.sanitize(raw, { ALLOWED_TAGS: ['p','br','strong','em','h1','h2','h3','h4','ul','ol','li','a','code','pre','table','thead','tbody','tr','th','td','blockquote','hr','img'], ALLOWED_ATTR: ['href','src','alt','class'] })
      : raw;
  }
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
}
```

- [ ] **Step 3: 添加响应式 CSS（在 style.css 末尾）**

```css
@media (max-width: 768px) {
  #sidebar {
    position: fixed; left: -220px; top: 0; bottom: 0; z-index: 100;
    transition: left 0.3s ease;
  }
  #sidebar.open { left: 0; }
  #chat-container { margin-left: 0; }
  #hamburger { display: block; }
}
#hamburger { display: none; position: fixed; top: 12px; left: 12px; z-index: 101;
  background: var(--surface); border: none; color: var(--text); font-size: 20px;
  padding: 6px 10px; border-radius: 6px; cursor: pointer; }
```

在 index.html 的 `<main id="chat-container">` 之前添加：
```html
<button id="hamburger" onclick="document.getElementById('sidebar').classList.toggle('open')">☰</button>
```

- [ ] **Step 4: 添加加载动画和打字机光标**

在 style.css 中添加：
```css
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
.typing-cursor::after { content: '▊'; animation: blink 1s infinite; color: var(--accent); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.message { animation: fadeIn 0.3s ease; }
```

- [ ] **Step 5: 按钮确认** — Task 2.4 的 `addMessage()` 已内置复制（📋）+ 下载（⬇️）按钮，此步骤跳过。

- [ ] **Step 6: Commit**

```bash
git add static/
git commit -m "feat: apply frontend design, markdown rendering, responsive, and animations"
```

---

### Task 3.2: 最终集成验证

- [ ] **Step 1: 启动应用**

```bash
python app.py
```

- [ ] **Step 2: 功能测试清单**

| 测试项 | 预期结果 |
|--------|----------|
| `http://localhost:8000` | 显示聊天界面 |
| 输入"你好" | 流式返回 AI 回复 |
| 上传 .txt 文件 | 显示文件预览 |
| 点击"文档总结" + 发送"总结这个文档" | 调用文档总结工具 |
| 点击"文案生成" + 发送"周报：完成了需求分析" | 调用文案生成工具 |
| 点击"联网检索" + 发送"今天天气" | 调用搜索工具 |
| 连续对话 > 10 轮 | 触发后台压缩 |
| 点击"新对话" | 清除历史 |
| 移动端（< 768px） | 侧边栏折叠 |
| 断开网络后发送 | 显示错误提示 |

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: final integration verification and cleanup"
```

---

## 依赖关系图

```
P0 (任务 0.1─0.3)          ← 先完成，能对话
    │
    ▼
P1 (任务 1.1─1.6)          ← 依赖 P0，三工具 + Function Calling
    │
    ▼
P2 (任务 2.1─2.4)          ← 依赖 P0+P1，记忆 + 异常 + 前端补全
    │
    ▼
P3 (任务 3.1─3.2)          ← 依赖 P2，视觉打磨 + 动效 + 验证
```

**不可并行**：所有任务顺序执行，每阶段内部可按文件独立并行。
