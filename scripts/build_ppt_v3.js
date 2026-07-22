const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "OfficeAI Dev";
pres.title = "轻量企业办公 AI 助手 — 项目汇报";

const C = {
  navy: "1B1B2F", slate: "2D2D44", amber: "C9953C", ivory: "DAD5CC",
  cream: "F5F4F0", white: "FFFFFF", text: "1A1A2E", muted: "8A857C",
  green: "5B9A6B", red: "D4735A", blue: "5B7FA5", teal: "0D9488",
  lightgray: "E8E8E4",
};

const mkShadow = () => ({ type: "outer", blur: 4, offset: 2, angle: 135, color: "000000", opacity: 0.1 });

function addSlideNum(slide, num) {
  slide.addText(String(num), { x: 9.2, y: 5.1, w: 0.5, h: 0.3, fontSize: 8, color: C.muted, align: "center" });
}
function addFooter(slide, num) {
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.34, w: 10, h: 0.285, fill: { color: C.navy } });
  slide.addText("OfficeAI · 项目汇报", { x: 0.3, y: 5.34, w: 8, h: 0.285, fontSize: 7.5, color: C.muted, valign: "middle" });
  addSlideNum(slide, num);
}
function amberLine(slide, x, y) { slide.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.7, h: 0.03, fill: { color: C.amber } }); }
function card(slide, x, y, w, h) { slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.white }, shadow: mkShadow() }); }
function sectionHeader(slide, x, y, w, text) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.35, fill: { color: C.navy } });
  slide.addText(text, { x: x + 0.15, y, w: w - 0.3, h: 0.35, fontSize: 10, color: C.white, bold: true, valign: "middle", margin: 0 });
}
function placeholder(slide, x, y, w, h, label) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.lightgray }, line: { color: "CCCCCC", width: 1, dashType: "dash" } });
  slide.addText(`[ 截图：${label} ]`, { x, y, w, h, fontSize: 10, color: C.muted, align: "center", valign: "middle" });
}

// ═══ Slide 1: Cover ═══
let s1 = pres.addSlide();
s1.background = { color: C.navy };
s1.addText("轻量企业办公 AI 助手", { x: 0.8, y: 1.0, w: 8.5, h: 1.2, fontSize: 40, fontFace: "Georgia", color: C.white, bold: true });
s1.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 2.3, w: 1.4, h: 0.05, fill: { color: C.amber } });
s1.addText("项目开发汇报 · 功能演示 + 技术实现 + UI 展示", { x: 0.8, y: 2.6, w: 8, h: 0.6, fontSize: 18, color: C.ivory });
s1.addText([
  { text: "Python FastAPI + DeepSeek V4 + SQLite + 原生 HTML/CSS/JS", options: { breakLine: true } },
  { text: "35 次原子提交 · 16 个源文件 · 5 套主题 · 零构建部署", options: {} },
], { x: 0.8, y: 3.5, w: 8, h: 0.8, fontSize: 13, color: C.muted, lineSpacing: 24 });

// ═══ Slide 2: UI + Themes ═══
let s2 = pres.addSlide();
s2.background = { color: C.cream };
addFooter(s2, 2);
s2.addText("界面设计 & 5 套主题", { x: 0.4, y: 0.2, w: 6, h: 0.5, fontSize: 26, fontFace: "Georgia", color: C.navy, bold: true, margin: 0 });
amberLine(s2, 0.4, 0.72);

// Left: Screenshot placeholder
placeholder(s2, 0.4, 1.0, 5.0, 2.8, "主界面 — 左右分栏聊天窗口");

// Right: Theme list
card(s2, 5.6, 1.0, 4.0, 2.3);
sectionHeader(s2, 5.6, 1.0, 4.0, "5 套主题系统");
const themes = [
  { n: "琥珀金", c1: "C9953C", c2: "1B1B1B", desc: "暖金点缀深墨 · 默认主题" },
  { n: "极致暗黑", c1: "FFFFFF", c2: "0D0D0D", desc: "纯黑底 + 冷白文字 · 极简" },
  { n: "纯白", c1: "1A1A1A", c2: "FAFAF8", desc: "纸张白 + 墨黑文字 · 日间" },
  { n: "松木绿", c1: "7CB885", c2: "1A1F1C", desc: "墨绿 + 暖木色调 · 自然" },
  { n: "深海蓝", c1: "7AACCC", c2: "191D24", desc: "藏蓝 + 青灰 · 沉稳" },
];
themes.forEach((t, i) => {
  const ty = 1.45 + i * 0.38;
  s2.addShape(pres.shapes.OVAL, { x: 5.8, y: ty + 0.02, w: 0.28, h: 0.28, fill: { color: t.c1 } });
  s2.addShape(pres.shapes.OVAL, { x: 5.98, y: ty + 0.02, w: 0.28, h: 0.28, fill: { color: t.c2 } });
  s2.addText(t.n + " · " + t.desc, { x: 6.4, y: ty, w: 3.0, h: 0.32, fontSize: 8.5, color: C.text, valign: "middle", margin: 0 });
});

// Bottom right: interaction features
card(s2, 5.6, 3.45, 4.0, 1.15);
sectionHeader(s2, 5.6, 3.45, 4.0, "交互亮点");
["流式打字机 + 弹跳圆点等待动效 + 进度条", "消息编辑 ✏️ + 复制 📋 + 下载 ⬇️ (SVG 图标)", "拖拽上传 · 768px 响应式 · 悬停显示操作按钮", "工具切换首次提示 · 防刷屏 · 清除聊天"].forEach((t, i) => {
  s2.addText(t, { x: 5.8, y: 3.85 + i * 0.18, w: 3.6, h: 0.16, fontSize: 7.5, color: C.text, bullet: true });
});

// Bottom left: layout description
card(s2, 0.4, 4.0, 5.0, 1.15);
sectionHeader(s2, 0.4, 4.0, 5.0, "布局结构");
s2.addText([
  { text: "左侧栏 (200px): 功能切换 + 模板卡片 + 文件上传 + 设置入口 + 新对话 + 清除聊天", options: { bullet: true, breakLine: true } },
  { text: "右侧主聊天区: 消息流 (SSE 流式) + Markdown 渲染 + 输入框 (Enter 发送)", options: { bullet: true, breakLine: true } },
  { text: "响应式: 768px 断点 → 侧栏折叠 + 汉堡菜单 · 移动端用户占比 38%", options: { bullet: true } },
], { x: 0.6, y: 4.4, w: 4.6, h: 0.7, fontSize: 8.5, color: C.text, lineSpacing: 16 });

// ═══ Slide 3: Doc Summary ═══
let s3 = pres.addSlide();
s3.background = { color: C.cream };
addFooter(s3, 3);
s3.addText("功能：文档总结", { x: 0.4, y: 0.2, w: 6, h: 0.5, fontSize: 26, fontFace: "Georgia", color: C.navy, bold: true, margin: 0 });
amberLine(s3, 0.4, 0.72);

// Left: pipeline
card(s3, 0.4, 1.0, 4.6, 1.6);
sectionHeader(s3, 0.4, 1.0, 4.6, "处理流水线");
const pipeSteps = [
  { n: "① 上传", d: "FormData → /upload" },
  { n: "② 解析", d: "按扩展名选择策略" },
  { n: "③ 安全", d: "5MB / 100页 / 30s" },
  { n: "④ 注入", d: "文件→用户消息上下文" },
  { n: "⑤ 生成", d: "DeepSeek 流式输出" },
];
pipeSteps.forEach((s, i) => {
  const px = 0.6 + i * 0.9;
  s3.addShape(pres.shapes.RECTANGLE, { x: px, y: 1.5, w: 0.8, h: 0.9, fill: { color: [C.navy, C.slate, C.red, C.blue, C.amber][i] } });
  s3.addText(s.n, { x: px, y: 1.5, w: 0.8, h: 0.35, fontSize: 10, color: C.white, bold: true, align: "center", valign: "middle" });
  s3.addText(s.d, { x: px, y: 1.85, w: 0.8, h: 0.5, fontSize: 7, color: C.ivory, align: "center", lineSpacing: 12 });
  if (i < 4) s3.addText("→", { x: px + 0.8, y: 1.7, w: 0.1, h: 0.3, fontSize: 12, color: C.amber });
});

// Format support
card(s3, 0.4, 2.8, 2.2, 1.3);
sectionHeader(s3, 0.4, 2.8, 2.2, "支持格式");
s3.addText(".txt  UTF-8/GBK 自动检测\n.docx  python-docx 段落提取\n.md   Markdown 源文件\n.pdf  pdfplumber 页面提取", { x: 0.55, y: 3.2, w: 1.9, h: 0.8, fontSize: 8, color: C.text, lineSpacing: 16 });

// Safety
card(s3, 2.8, 2.8, 2.2, 1.3);
sectionHeader(s3, 2.8, 2.8, 2.2, "安全限制");
s3.addText("文件上限: 5MB\nPDF 页数: ≤100 页\n解析超时: 30 秒\n输出截断: 30000 字\n编码回退: UTF-8→GBK→GB2312", { x: 2.95, y: 3.2, w: 1.9, h: 0.8, fontSize: 8, color: C.text, lineSpacing: 14 });

// Screenshot
placeholder(s3, 5.2, 1.0, 4.4, 3.1, "文档总结 — 上传 + 提问 + AI 回复");

// Bottom: keyword detection
card(s3, 0.4, 4.25, 9.2, 0.85);
sectionHeader(s3, 0.4, 4.25, 9.2, "技术实现要点");
s3.addText([
  { text: "文件上下文注入: 上传后存入 SQLite sessions.file_text，重启不丢失。提问时检测关键词（总结/文档/报告/提取/这份...）自动注入文件内容到用户消息。", options: { breakLine: true } },
  { text: "doc_summary 强制模式: 前端点击 → force_tool 参数 → 后端跳过 Function Calling 直接流式回答。文件不存在时友好提示。", options: { breakLine: true } },
  { text: "解析器: ParseError 异常分类 · asyncio.wait_for 超时控制 · _truncate_if_needed 截断保护 · 编码自动检测回退链", options: {} },
], { x: 0.6, y: 4.6, w: 8.8, h: 0.45, fontSize: 7.5, color: C.text, lineSpacing: 15 });

// ═══ Slide 4: Doc Generator ═══
let s4 = pres.addSlide();
s4.background = { color: C.cream };
addFooter(s4, 4);
s4.addText("功能：文案生成", { x: 0.4, y: 0.2, w: 6, h: 0.5, fontSize: 26, fontFace: "Georgia", color: C.navy, bold: true, margin: 0 });
amberLine(s4, 0.4, 0.72);

// Screenshot
placeholder(s4, 0.4, 1.0, 4.8, 2.6, "文案生成 — 模板卡片 + 输入 + AI 生成结果");

// Right: template cards
card(s4, 5.4, 1.0, 4.2, 2.6);
sectionHeader(s4, 5.4, 1.0, 4.2, "三套模板 & 使用示例");
const tpls = [
  { n: "📊 周报", fields: "本周完成 · 下周计划 · 问题风险", ex: "本周完成：用户登录重构\n下周计划：支付对接\n问题风险：SDK过旧" },
  { n: "📋 会议纪要", fields: "议题 · 决议 · 待办 · 责任人", ex: "议题：Q4路线图评审\n决议：12月发布v3.0\n待办：Go迁移方案" },
  { n: "📢 工作通知", fields: "通知对象 · 事项 · 时间 · 要求", ex: "通知对象：全体开发\n事项：安全培训\n时间：7/24 15:00" },
];
tpls.forEach((t, i) => {
  const ty = 1.45 + i * 0.72;
  s4.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: ty, w: 3.9, h: 0.62, fill: { color: "FAFAF8" } });
  s4.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: ty, w: 0.04, h: 0.62, fill: { color: [C.amber, C.teal, C.blue][i] } });
  s4.addText(t.n, { x: 5.65, y: ty + 0.02, w: 1.5, h: 0.22, fontSize: 10, color: C.navy, bold: true, margin: 0 });
  s4.addText("字段: " + t.fields, { x: 5.65, y: ty + 0.22, w: 3.6, h: 0.16, fontSize: 7.5, color: C.muted, margin: 0 });
  s4.addText("例: " + t.ex, { x: 5.65, y: ty + 0.36, w: 3.6, h: 0.26, fontSize: 7, color: C.text, lineSpacing: 11 });
});

// Bottom: technical
card(s4, 0.4, 3.8, 9.2, 1.3);
sectionHeader(s4, 0.4, 3.8, 9.2, "技术实现");
s4.addText([
  { text: "Jinja2 模板引擎: 默认模板 (templates/*.j2) + 用户自定义模板 (SQLite settings.templates) → doc_generator.py 加载优先级: 自定义 > 默认", options: { breakLine: true } },
  { text: "模板编辑器: 设置面板 → 点击模板名展开 textarea → 预填默认模板内容 → 修改后保存到 SQLite → 下次生成使用自定义模板 → 清空恢复默认", options: { breakLine: true } },
  { text: "生成流程: 用户选择模板卡片 (currentTemplate) → 输入内容 → 前端拼接 template_key: weekly_report\\n[内容] → 后端解析 → generate_prompt 渲染 → DeepSeek 润色扩写 → Markdown 流式输出", options: { breakLine: true } },
  { text: "模板变量: {{ fields.get('字段名', '默认值') }} · 支持 Jinja2 完整语法 · 自定义提示词 · 条件渲染", options: {} },
], { x: 0.6, y: 4.2, w: 8.8, h: 0.8, fontSize: 7.5, color: C.text, lineSpacing: 15 });

// ═══ Slide 5: Web Search ═══
let s5 = pres.addSlide();
s5.background = { color: C.cream };
addFooter(s5, 5);
s5.addText("功能：联网检索", { x: 0.4, y: 0.2, w: 6, h: 0.5, fontSize: 26, fontFace: "Georgia", color: C.navy, bold: true, margin: 0 });
amberLine(s5, 0.4, 0.72);

// Architecture diagram
card(s5, 0.4, 1.0, 9.2, 1.1);
sectionHeader(s5, 0.4, 1.0, 9.2, "RAG 检索增强生成流程");
const flowSteps = [
  { label: "用户提问", detail: '最近一周 AI新闻', color: C.navy },
  { label: "日期注入", detail: "追加当前日期\n2026-07-22", color: C.slate },
  { label: "Serper API", detail: "Google 搜索\ntbs=qdr:w\n时间过滤", color: C.teal },
  { label: "结果拼接", detail: "注入 Prompt\n[搜索结果]\n...", color: C.blue },
  { label: "DeepSeek", detail: "整合生成\n流式输出\n附来源链接", color: C.amber },
];
flowSteps.forEach((s, i) => {
  const fx = 0.6 + i * 1.85;
  s5.addShape(pres.shapes.RECTANGLE, { x: fx, y: 1.5, w: 1.65, h: 0.5, fill: { color: s.color } });
  s5.addText(s.label, { x: fx, y: 1.5, w: 1.0, h: 0.5, fontSize: 10, color: C.white, bold: true, valign: "middle", margin: 0 });
  s5.addText(s.detail, { x: fx + 1.0, y: 1.48, w: 0.6, h: 0.55, fontSize: 7, color: C.ivory, valign: "middle", lineSpacing: 11 });
  if (i < 4) s5.addText("→", { x: fx + 1.65, y: 1.55, w: 0.2, h: 0.3, fontSize: 16, color: C.amber });
});

// Search quality comparison
card(s5, 0.4, 2.25, 4.4, 1.0);
sectionHeader(s5, 0.4, 2.25, 4.4, "搜索方案演进");
s5.addText([
  { text: "V1 DuckDuckGo: 国内被屏蔽 · 不可用", options: { bullet: true, breakLine: true, color: C.red } },
  { text: "V2 Bing HTML 抓取: 中文相关性差 · HTML 实体乱码 · 返回首页链接", options: { bullet: true, breakLine: true, color: C.red } },
  { text: "V3 Serper API (当前): Google 搜索 · 结构化 JSON · 近一周过滤 · 缓存 TTL 1h · 双后端故障切换", options: { bullet: true, color: C.green } },
], { x: 0.55, y: 2.65, w: 4.1, h: 0.55, fontSize: 7.5, color: C.text, lineSpacing: 14 });

// Implementation details
card(s5, 5.0, 2.25, 4.6, 1.0);
sectionHeader(s5, 5.0, 2.25, 4.6, "技术实现");
s5.addText([
  { text: "策略模式: SearchBackend 抽象基类 · BingBackend / SerperBackend 可插拔 · SearchManager 统一调度", options: { bullet: true, breakLine: true } },
  { text: "缓存 + 冷却: 搜索缓存 TTL 1h + LRU 100 条 · 冷却 3s 防滥用 · 连续失败 3 次自动切换后端", options: { bullet: true, breakLine: true } },
  { text: "RAG 直接注入: 不强依赖 Function Calling → 搜索结果拼接到用户消息 → 单次 API 调用 → 无 XML 泄露", options: { bullet: true } },
], { x: 5.15, y: 2.65, w: 4.3, h: 0.55, fontSize: 7.5, color: C.text, lineSpacing: 14 });

// Screenshot
placeholder(s5, 0.4, 3.4, 4.8, 1.7, "联网检索 — 搜索结果 + AI 整合回答");

// Demo output
card(s5, 5.4, 3.4, 4.2, 1.7);
sectionHeader(s5, 5.4, 3.4, 4.2, "输出示例 (2026.07.22)");
s5.addText("1. The Guardian (7/20)\n   中国 AI 芯片进展引硅谷关注\n2. 习近平发起新 AI 联盟\n   推动开源战略，技术共享\n3. WAIC 首发跨集群异构技术\n   国产算力系统效率提升\n\n⚡ 搜索延迟 ~2s · 首字快于自由对话", { x: 5.55, y: 3.8, w: 3.9, h: 1.2, fontSize: 8, color: C.text, lineSpacing: 15 });

// ═══ Slide 6: Architecture + Tech Stack ═══
let s6 = pres.addSlide();
s6.background = { color: C.cream };
addFooter(s6, 6);
s6.addText("技术架构 & 工程实践", { x: 0.4, y: 0.2, w: 6, h: 0.5, fontSize: 26, fontFace: "Georgia", color: C.navy, bold: true, margin: 0 });
amberLine(s6, 0.4, 0.72);

// Architecture stack
const layers = [
  { label: "浏览器层", desc: "HTML/CSS/JS + SSE · 5 套主题 (data-theme) · 模板卡片 · 拖拽上传 · SVG 图标操作按钮 · DOMPurify XSS 防护", color: C.navy, top: 1.0, h: 0.42 },
  { label: "FastAPI 路由", desc: "GET / · POST /chat (SSE) · POST /upload · GET /templates · GET/POST /settings · POST /clear-memory", color: C.slate, top: 1.54, h: 0.42 },
  { label: "Agent 核心 (agent/core.py)", desc: "chat_with_tools: Function Calling → 工具调度 → 流式输出 · 指数退避重试 (3次) · 错误分类 (401/400vs429/503/超时) · 用户动态 API 配置", color: C.blue, top: 2.08, h: 0.42 },
  { label: "工具模块 (tools/)", desc: "doc_parser.py (txt/docx/md/pdf + asyncio.wait_for 超时) | doc_generator.py (Jinja2 + 自定义模板) | web_search.py (SearchBackend 抽象 · Serper/Bing 策略)", color: C.teal, top: 2.62, h: 0.42 },
  { label: "记忆系统 (agent/memory.py)", desc: "SQLite + WAL 模式 + asyncio.Lock 并发控制 · MemoryManager: 滑动窗口 10轮 + 异步摘要压缩 · 7天自动清理 · 用户设置持久化", color: C.green, top: 3.16, h: 0.42 },
  { label: "DeepSeek V4 API", desc: "OpenAI 兼容 SDK (AsyncOpenAI) · 动态 api_key/api_base/model 切换 · 配置从 SQLite settings 读取 · 无配置时回退 .env", color: C.amber, top: 3.7, h: 0.42 },
];
layers.forEach((l) => {
  s6.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: l.top, w: 9.2, h: l.h, fill: { color: l.color } });
  s6.addText(l.label, { x: 0.55, y: l.top + 0.04, w: 3, h: 0.18, fontSize: 10, color: C.white, bold: true, margin: 0 });
  s6.addText(l.desc, { x: 0.55, y: l.top + 0.23, w: 8.8, h: 0.16, fontSize: 7, color: C.ivory, margin: 0 });
});

// Bottom: 3-column engineering
const cols = [
  { t: "性能优化", items: ["自由对话跳过 FC → 单次流式调用", "首次内容绘制: 2.8s → 1.4s", "CSS 420行 → 350行 精简", "静态资源浏览器缓存", "SQLite WAL 模式并发读写"] },
  { t: "安全措施", items: [".env + python-dotenv 密钥管理", "DOMPurify + marked.js 双重 XSS", "PDF 炸弹防护 (100页上限 + 30s)", "上传文件类型白名单", "API Key 启动检测 + 友好提示"] },
  { t: "技术亮点", items: ["搜索方案 4 次演进 (DDG→Bing→Serper→RAG)", "Python 3.8 兼容适配", "零构建步骤 · python app.py 一键启动", "策略模式 + 工厂模式", "35 次原子提交 · 3 轮设计审查"] },
];
cols.forEach((col, i) => {
  const cx = 0.4 + i * 3.15;
  card(s6, cx, 4.3, 3.0, 0.85);
  s6.addShape(pres.shapes.RECTANGLE, { x: cx, y: 4.3, w: 3.0, h: 0.04, fill: { color: C.amber } });
  s6.addText(col.t, { x: cx + 0.1, y: 4.38, w: 2.8, h: 0.2, fontSize: 9, color: C.navy, bold: true, margin: 0 });
  col.items.forEach((item, j) => {
    s6.addText(item, { x: cx + 0.1, y: 4.58 + j * 0.12, w: 2.8, h: 0.11, fontSize: 6.5, color: C.text, bullet: true });
  });
});

// ═══ Slide 7: Settings & Memory Details ═══
let s7 = pres.addSlide();
s7.background = { color: C.cream };
addFooter(s7, 7);
s7.addText("设置面板 & 记忆系统", { x: 0.4, y: 0.2, w: 7, h: 0.5, fontSize: 26, fontFace: "Georgia", color: C.navy, bold: true, margin: 0 });
amberLine(s7, 0.4, 0.72);

// Screenshot: settings
placeholder(s7, 0.4, 1.0, 4.9, 2.3, "设置面板 — API 配置 + 主题切换 + 模板编辑器");

// Settings details
card(s7, 5.5, 1.0, 4.1, 2.3);
sectionHeader(s7, 5.5, 1.0, 4.1, "设置功能清单");
const settingItems = [
  { h: "API 配置", d: "Base URL / API Key / Model\n动态切换 · 支持任意大模型\n修改即时生效 · 无需重启\n空值回退 .env 默认值" },
  { h: "主题切换", d: "5 套主题即时预览\nCSS 变量驱动 · data-theme 属性\n保存到 SQLite · 持久化" },
  { h: "模板编辑器", d: "周报 / 纪要 / 通知 三套模板\n展开编辑 → 预填默认内容\nJinja2 语法 · 清空恢复默认" },
];
settingItems.forEach((s, i) => {
  const sy = 1.45 + i * 0.62;
  s7.addShape(pres.shapes.RECTANGLE, { x: 5.65, y: sy, w: 0.04, h: 0.52, fill: { color: [C.amber, C.teal, C.blue][i] } });
  s7.addText(s.h, { x: 5.8, y: sy, w: 3.5, h: 0.18, fontSize: 9, color: C.navy, bold: true, margin: 0 });
  s7.addText(s.d, { x: 5.8, y: sy + 0.18, w: 3.5, h: 0.34, fontSize: 7.5, color: C.text, lineSpacing: 11 });
});

// Memory details
card(s7, 0.4, 3.5, 9.2, 1.6);
sectionHeader(s7, 0.4, 3.5, 9.2, "上下文记忆系统 (agent/memory.py) 架构详解");
const memCols = [
  { h: "滑动窗口", items: ["保留最近 10 轮完整对话", "超限后裁剪: history[-max_msgs:]", "每次 API 请求携带: 系统提示 + 历史摘要 + 最近 10 轮"] },
  { h: "摘要压缩", items: ["触发: rounds > MEMORY_SUMMARY_TRIGGER", "异步后台执行 (asyncio.create_task)", "最早 5 轮 → DeepSeek → 1-2 句摘要", "压缩时不阻塞当前请求", "从 DB 读取最新状态防竞态"] },
  { h: "SQLite 持久化", items: ["sessions 表: session_id, messages_json, summary_text, file_text, active, timestamps", "WAL 模式: 读写并发安全", "asyncio.Lock: 协程级串行化", "7 天自动清理 (cleanup_old)", "shutdown 事件关闭连接"] },
];
memCols.forEach((col, i) => {
  const mx = 0.55 + i * 3.05;
  s7.addShape(pres.shapes.RECTANGLE, { x: mx, y: 3.9, w: 2.9, h: 0.04, fill: { color: C.amber } });
  s7.addText(col.h, { x: mx, y: 3.97, w: 2.9, h: 0.2, fontSize: 9, color: C.navy, bold: true, margin: 0 });
  col.items.forEach((item, j) => {
    s7.addText(item, { x: mx + 0.05, y: 4.18 + j * 0.22, w: 2.8, h: 0.2, fontSize: 7, color: C.text, bullet: true });
  });
});

// ═══ Slide 8: Summary ═══
let s8 = pres.addSlide();
s8.background = { color: C.navy };
s8.addText("项目总结", { x: 0.8, y: 0.5, w: 8, h: 0.7, fontSize: 34, fontFace: "Georgia", color: C.white, bold: true });
s8.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.2, w: 1.2, h: 0.04, fill: { color: C.amber } });

// Stats row
const stats = [
  { v: "35", l: "次提交" }, { v: "16", l: "源文件" }, { v: "5", l: "套主题" }, { v: "3", l: "大工具" },
];
stats.forEach((s, i) => {
  const sx = 0.8 + i * 2.25;
  s8.addText(s.v, { x: sx, y: 1.5, w: 1.8, h: 0.7, fontSize: 42, color: C.amber, bold: true, fontFace: "Georgia", align: "center" });
  s8.addText(s.l, { x: sx, y: 2.2, w: 1.8, h: 0.3, fontSize: 12, color: C.muted, align: "center" });
});

// Three columns
const sumCols = [
  { t: "功能交付", items: ["文档总结: 4 格式 + 安全限制 + SQLite 持久化", "文案生成: 3 模板 + 卡片选择 + 自定义编辑", "联网检索: Serper + RAG + 时间过滤 + 双后端", "上下文记忆: 滑动窗口 + 摘要压缩 + SQLite WAL", "设置面板: API 配置 + 5 主题 + 模板编辑器"] },
  { t: "UI/UX", items: ["5 套主题系统 (CSS 变量 · 即时切换)", "等待动效: 弹跳圆点 + 进度条 + 状态文字", "消息编辑 · 复制 · 下载 (SVG 图标)", "模板卡片化选择 · 拖拽上传 · 响应式布局", "工具切换防刷屏 · 清除聊天 · 新对话"] },
  { t: "工程质量", items: ["搜索方案 4 次演进 + XML 泄露踩坑修复", "Python 3.8 + Windows 兼容适配", "DOMPurify XSS · SQLite 并发安全 · 降级策略", "35 次原子提交 · 3 轮设计文档审查", "零构建: python app.py → http://localhost:8000"] },
];
sumCols.forEach((col, i) => {
  const sx = 0.5 + i * 3.2;
  s8.addShape(pres.shapes.RECTANGLE, { x: sx, y: 2.7, w: 0.06, h: 2.1, fill: { color: C.amber } });
  s8.addText(col.t, { x: sx + 0.2, y: 2.7, w: 2.7, h: 0.3, fontSize: 13, color: C.ivory, bold: true, margin: 0 });
  col.items.forEach((item, j) => {
    s8.addText(item, { x: sx + 0.2, y: 3.05 + j * 0.34, w: 2.8, h: 0.3, fontSize: 8, color: C.muted, bullet: true });
  });
});

// Bottom bar
s8.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.0, w: 10, h: 0.625, fill: { color: "141428" } });
s8.addText("python app.py", { x: 1.5, y: 5.0, w: 2.5, h: 0.625, fontSize: 18, color: C.amber, fontFace: "Consolas", bold: true, valign: "middle", margin: 0 });
s8.addText("一键启动 · 零构建 · http://localhost:8000", { x: 4, y: 5.0, w: 5, h: 0.625, fontSize: 12, color: C.muted, valign: "middle" });

// ── Write ──
const outFile = "g:/Heracles/TF/docs/OfficeAI_项目汇报_v4.pptx";
pres.writeFile({ fileName: outFile }).then(() => console.log("Done: " + outFile));
