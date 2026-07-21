# 轻量企业办公 AI 助手 Agent — 设计文档

> 日期：2026-07-21
> 状态：已确认
> 项目：E1 级 — 基于大模型 API 的智能办公助手

---

## 1. 项目概述

开发一个轻量级企业办公 AI 助手 Agent，提供文档总结、规则化文案生成、联网检索三大核心能力，配以简易 Web 聊天界面。

## 2. 技术选型

| 维度 | 选择 | 理由 |
|------|------|------|
| **大模型** | DeepSeek V4 API | 国内网络通畅、兼容 OpenAI SDK、中文优化好、性价比高 |
| **后端框架** | FastAPI (Python) | 原生 SSE 支持流式输出、异步高性能、生态完善 |
| **前端** | 原生 HTML/CSS/JS | 轻量，无构建步骤，单文件部署，与 FastAPI 静态文件挂载无缝集成 |
| **文档解析** | python-docx + pdfplumber | 覆盖 .txt / .docx / .md / .pdf 全格式 |
| **模板引擎** | Jinja2 | Python 标准模板引擎，FastAPI 内置支持 |
| **联网检索** | DuckDuckGo（默认）+ Serper（备用） | DuckDuckGo 免费无需 API Key；Serper 备灾切换 |
| **API Key 管理** | 环境变量（`.env` + `python-dotenv`） | 禁止硬编码，遵循 12-Factor App |
| **部署（开发）** | 单命令 `python app.py` | 开发/演示场景，uvicorn 单进程 |
| **部署（生产）** | `gunicorn -w 4 -k uvicorn.workers.UvicornWorker` 或 Docker | 多 worker 利用多核，进程守护 |

### 为什么不用 DeepSeek API 原生的联网搜索？

DeepSeek 官方 API **不支持**联网搜索功能（仅限网页端 chat.deepseek.com）。因此采用 RAG 模式：自建搜索工具获取实时数据 → 注入 Prompt 上下文 → DeepSeek 整合输出。

## 3. 项目结构

```
office-ai-assistant/
├── app.py                  # 入口：FastAPI 启动
├── config.py               # 集中配置（API Key、模型参数、模板注册）
├── requirements.txt         # 依赖清单
│
├── agent/                   # 🧠 Agent 核心
│   ├── core.py              #   对话管理 + Function Calling 工具调度
│   └── memory.py            #   上下文记忆（滑动窗口 + 摘要压缩）
│
├── tools/                   # 🔧 工具模块
│   ├── doc_parser.py        #   📄 文档解析器（txt/docx/md/pdf → 纯文本）
│   ├── doc_generator.py     #   📝 文案生成器（Jinja2 模板 + AI 润色）
│   └── web_search.py        #   🔍 联网检索（策略模式，双后端可切换）
│
├── api/                     # 🌐 API 路由
│   └── routes.py            #   /chat /upload /templates /clear-memory
│
├── data/                    # 💾 数据（自动生成）
│   └── sessions.db          #   SQLite 会话记忆库
│
└── static/                  # 🎨 前端
    ├── index.html           #   页面结构（聊天界面 + 侧边栏）
    ├── style.css            #   样式（独立视觉设计，非大众化 AI 风格）
    └── app.js               #   交互逻辑（SSE 流式、文件上传、Markdown 渲染）
```

## 4. 模块设计

### 4.1 Agent 核心（`agent/core.py`）

- **对话管理**：接收用户消息，维护对话历史列表
- **意图识别**：通过 DeepSeek Function Calling 判断用户意图，决定调用哪个工具
- **手动工具选择**：前端侧边栏允许用户强制指定工具，跳过意图识别（纠错机制）。当用户明确点击"文档总结"时，Agent 直接调用该工具而非依赖模型判断
- **工具调度**：定义 3 个 Function definitions，DeepSeek 返回 tool_call 时执行对应工具，将结果回传模型生成最终回复
- **流式输出**：通过 SSE 将 DeepSeek 的 streaming response 逐块推送到前端
- **SSE 断线重连**：前端 `EventSource` 监听 `onerror`，自动重连（初始延迟 1s，指数退避，上限 30s），重连后携带 `last_event_id` 恢复流
- **API 重试策略**：指数退避重试 3 次（1s → 2s → 4s），区分可重试错误（429/503/超时）和不可重试错误（401/400），不可重试错误直接返回友好提示

### 4.2 记忆系统（`agent/memory.py`）

采用**滑动窗口 + 摘要压缩**混合策略：

- 保留最近 **10 轮**完整对话
- 当第 11 轮对话开始时，**异步后台压缩**最早 5 轮为 1-2 句摘要（不阻塞用户当前请求）
- 压缩过程中用户看到的第 11 轮回复正常流式返回，摘要在下一次请求时生效
- 每次 API 请求携带：`系统提示 + 历史摘要 + 最近 10 轮对话`
- **持久化**：使用 SQLite 数据库（`sessions.db`）存储会话历史，单文件、天然支持并发读写、无需额外进程
  - 表结构：`sessions(session_id, messages_json, summary_text, created_at, updated_at)`
  - 自动清理：超过 7 天未活跃的会话自动删除
- 用户点击"新对话"时清空当前会话（软删除，`active=0`）

### 4.3 文档解析器（`tools/doc_parser.py`）

| 格式 | 解析方式 | 库 |
|------|----------|-----|
| `.txt` | 直接读取（UTF-8 / GBK 自动检测） | 内置 |
| `.docx` | 提取段落文本 | python-docx |
| `.md` | 直接读取 | 内置 |
| `.pdf` | 提取页面文本 | pdfplumber |

**安全措施**：
- 文件大小限制：5MB
- PDF 页数上限：100 页（防止 PDF 炸弹）
- 单文件解析超时：30 秒（`asyncio.wait_for`）
- 统一输出：纯文本字符串

### 4.4 文案生成器（`tools/doc_generator.py`）

三套 Jinja2 模板：

| 模板 | 必填字段 | 输出格式 |
|------|----------|----------|
| 周报 | 本周完成、下周计划、问题风险 | Markdown 表格 |
| 会议纪要 | 议题、决议、待办事项、责任人、截止日 | Markdown 列表 |
| 工作通知 | 通知对象、事项内容、时间地点、注意事项 | 正式公文格式 |

流程：用户选择模板 + 填写关键信息 → Jinja2 渲染骨架 → DeepSeek 润色扩写 → Markdown 输出。

### 4.5 联网检索（`tools/web_search.py`）

采用**策略模式**设计，自动故障切换：

```python
# config.py
WEB_SEARCH_BACKEND = "duckduckgo"        # 默认
WEB_SEARCH_FALLBACK = "serper"            # 备用
WEB_SEARCH_TIMEOUT = 10                  # 单次搜索超时（秒）
WEB_SEARCH_MAX_RESULTS = 5               # 每次返回结果数
WEB_SEARCH_COOLDOWN = 3                  # 两次搜索最小间隔（秒）
WEB_SEARCH_CACHE_TTL = 3600              # 搜索结果缓存（秒）
WEB_SEARCH_FAIL_THRESHOLD = 3            # 连续失败 N 次后切换后端
```

- `SearchBackend` 抽象基类，定义 `search(query) -> list[SearchResult]` 接口
- `DuckDuckGoBackend`：免费，无需 API Key，使用 `duckduckgo_search` 库
- `SerperBackend`：serper.dev API（免费层 2500 次/月），结果质量更高
- **故障切换**：DDG 连续失败 ≥ 3 次 → 自动切到 Serper → DDG 恢复后手动切回（或 1 小时后自动尝试切回）
- **本地缓存**：相同查询在 TTL 内直接返回缓存，减少 API 调用
- 切换后端只需修改 `config.py` 中的一行配置
- 内置调用冷却（cooldown）防止频率过高

搜索结果与用户原始问题拼接后发送给 DeepSeek，由模型整合为自然语言回答，末尾附信息来源链接。

## 5. API 端点设计

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/` | 返回前端页面（static/index.html） |
| `POST` | `/chat` | 对话接口，SSE 流式返回 |
| `POST` | `/upload` | 文件上传。返回文件名 + 文本预览片段（前 500 字） |
| `GET` | `/templates` | 返回可用模板列表（名称、描述、必填字段） |
| `POST` | `/clear-memory` | 清除指定会话的记忆 |

### `POST /chat` 请求体

```json
{
  "message": "帮我总结这个文档",
  "session_id": "abc123",
  "force_tool": null
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `message` | string | 是 | 用户输入文本 |
| `session_id` | string | 是 | 会话标识，前端 UUID 生成 |
| `force_tool` | string \| null | 否 | 强制使用指定工具，跳过意图识别。可选值：`"doc_summary"` `"doc_generate"` `"web_search"`。`null`（默认）表示自动判断 |

### 强制工具选择的边界处理

- `force_tool="doc_summary"` 但会话中无已上传文件 → Agent 回复提示"请先上传需要总结的文档"
- `force_tool="doc_generate"` 但未指定模板 → Agent 回复提示"请先选择文案模板（周报/会议纪要/工作通知）"
- `force_tool="web_search"` → 直接将用户消息作为搜索关键词，无需额外检查
- 当 `force_tool` 有值时，Function Calling 的 `tools` 参数只传该工具定义，降低模型误判概率

## 6. 数据流

### 通用流程
```
用户输入 → POST /chat（SSE）→ Agent 判断意图
    → [有工具需求] → Function Calling → 执行工具 → 结果回传
    → DeepSeek streaming → SSE 逐块推送 → 前端渲染
```

### 文档总结流程
```
上传文件 → POST /upload → doc_parser 解析 → 返回文本预览
用户确认 → POST /chat → Agent 识别 + 文档内容作为上下文 → DeepSeek 总结 → 流式返回
```

### 文案生成流程
```
用户选择模板 → 填写字段 → POST /chat → Jinja2 渲染骨架 → DeepSeek 润色 → Markdown 输出
```

### 联网检索流程
```
用户提问 → POST /chat → Function Calling 触发 search 工具
    → DuckDuckGo/Sperer 搜索 → 取 Top 5 → 拼接 Prompt → DeepSeek 整合 → 流式返回
```

## 7. 界面设计

### 布局
- **左右分栏**：左侧边栏（180px） + 右侧主聊天区
- 左侧边栏：新对话按钮 → 功能切换（自由对话/文档总结/文案生成/联网检索）→ 历史会话列表
- 右侧：聊天气泡列表 + 底部输入区

### 交互
- AI 回复流式逐字显示（打字机效果）
- 消息气泡：AI 左对齐（深色），用户右对齐（主题色）
- 模板选择：卡片式，高亮当前选中
- 文件上传：按钮 + 拖拽区域
- Enter 发送，Shift+Enter 换行

### 响应式
- 宽度 < 768px 时侧边栏自动折叠，变为汉堡菜单

### 视觉设计
- **配色**：实现阶段调用 `frontend-design` skill 独立设计，不走大众化紫色 AI 风格
- 暗色主题，长时间办公护眼
- Markdown 渲染（代码高亮、表格、复制按钮）

## 8. 异常处理

### 8.1 错误分类与重试

| 错误类型 | 示例 | 可重试？ | 策略 |
|----------|------|----------|------|
| 网络超时 | `httpx.TimeoutException` | ✅ | 指数退避重试 3 次（1s → 2s → 4s） |
| 服务繁忙 | HTTP 429 / 503 | ✅ | 指数退避重试 3 次，等待 `Retry-After` 头 |
| 鉴权失败 | HTTP 401 | ❌ | 直接提示"API Key 无效，请检查配置" |
| 参数错误 | HTTP 400 | ❌ | 记录日志 + 提示"请求参数有误" |
| 文档解析超时 | 30s 无响应 | ❌ | 提示"文档过大或格式异常，请尝试分批处理" |

### 8.2 场景处理

| 场景 | 处理方式 |
|------|----------|
| 文件 > 5MB | 前端拦截 + "文件过大（上限 5MB），请压缩后重试" |
| PDF > 100 页 | 后端拦截 + "PDF 页数超过上限（100页），请分批上传" |
| 不支持的文件格式 | 返回支持格式列表（.txt .docx .md .pdf） |
| API Key 缺失 | 启动时检查环境变量 `DEEPSEEK_API_KEY`，缺失则打印配置指引并退出 |
| 全部重试失败 | "服务暂时不可用，请稍后重试" + 请求 ID 方便排查 |
| 输出过长 | max_tokens=4096 + 前端显示"（回答已达到长度上限）" |
| 搜索频率过高 | cooldown 机制 + "请稍后再试（两次搜索需间隔 3 秒以上）" |
| DeepSeek 彻底不可用 | 降级提示"AI 服务当前不可用，请检查网络或稍后重试"，不清空用户输入 |

### 8.3 降级策略

- 联网检索后端故障 → 自动切换备用后端，对用户透明
- DeepSeek API 不可用 → 友好提示，保留对话历史，不丢失上下文
- 前端 SSE 断线 → 自动重连（1s 初始延迟，指数退避到 30s 上限），重连成功后继续接收流

## 9. 开发阶段

| 阶段 | 内容 | 里程碑 |
|------|------|--------|
| **P0** | 项目骨架 + FastAPI + DeepSeek 对话 + 基础聊天 UI | 能对话 |
| **P1** | 三工具实现 + Function Calling + 文件上传 | 能总结/生成/搜索 |
| **P2** | 摘要记忆 + 输出限制 + 异常处理全覆盖 | 有记忆、不崩溃 |
| **P3** | 独立视觉设计 + 响应式 + 动效 + 下载 | 精致交付 |

预估总工期：2-2.5 小时（单人开发）。

## 10. 配置项总览

所有敏感信息从环境变量读取，开发环境使用 `.env` 文件（不提交到 Git）。

```python
import os
from dotenv import load_dotenv
load_dotenv()

# DeepSeek（从环境变量读取，禁止硬编码）
DEEPSEEK_API_KEY = os.environ["DEEPSEEK_API_KEY"]
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")

# 输出控制
MAX_OUTPUT_TOKENS = 4096
TEMPERATURE = 0.7

# 记忆
MEMORY_MAX_ROUNDS = 10            # 保留完整对话轮数
MEMORY_SUMMARY_TRIGGER = 10       # 触发压缩的轮数阈值
MEMORY_DB_PATH = "data/sessions.db"  # SQLite 数据库路径
MEMORY_TTL_DAYS = 7               # 会话自动清理天数

# 文件上传
MAX_FILE_SIZE_MB = 5
MAX_PDF_PAGES = 100               # PDF 页数上限
PARSE_TIMEOUT_SEC = 30            # 单文件解析超时
ALLOWED_EXTENSIONS = ["txt", "docx", "md", "pdf"]

# API 重试
MAX_RETRIES = 3                   # 最大重试次数
RETRY_BASE_DELAY = 1.0            # 基础延迟（秒），指数退避
REQUEST_TIMEOUT = 30              # 请求超时（秒）

# 联网检索
WEB_SEARCH_BACKEND = "duckduckgo"
WEB_SEARCH_FALLBACK = "serper"
SERPER_API_KEY = os.getenv("SERPER_API_KEY", "")
WEB_SEARCH_TIMEOUT = 10
WEB_SEARCH_MAX_RESULTS = 5
WEB_SEARCH_COOLDOWN = 3
WEB_SEARCH_CACHE_TTL = 3600       # 缓存 TTL（秒）
WEB_SEARCH_FAIL_THRESHOLD = 3     # 连续失败阈值

# 模板注册
TEMPLATES = {
    "weekly_report": {"name": "周报", "fields": ["本周完成", "下周计划", "问题风险"]},
    "meeting_minutes": {"name": "会议纪要", "fields": ["议题", "决议", "待办事项", "责任人"]},
    "work_notice": {"name": "工作通知", "fields": ["通知对象", "事项内容", "时间", "要求"]},
}
```

### `.env` 文件示例（不提交到 Git）

```
DEEPSEEK_API_KEY=sk-your-key-here
SERPER_API_KEY=           # 可选，DDG 故障时启用
```

## 11. 依赖清单（`requirements.txt`）

```
fastapi>=0.110.0
uvicorn[standard]>=0.29.0
openai>=1.30.0              # DeepSeek 兼容 OpenAI SDK
python-docx>=1.1.0
pdfplumber>=0.10.0
jinja2>=3.1.0
httpx>=0.27.0               # 联网请求
duckduckgo-search>=6.0.0
python-multipart>=0.0.9     # 文件上传
markdown>=3.6.0             # Markdown 渲染
python-dotenv>=1.0.0        # 环境变量管理
gunicorn>=22.0.0            # 生产部署（可选）
```

## 12. `.gitignore` 关键条目

```
.env
sessions.db
__pycache__/
*.pyc
```
