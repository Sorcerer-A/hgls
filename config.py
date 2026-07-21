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
