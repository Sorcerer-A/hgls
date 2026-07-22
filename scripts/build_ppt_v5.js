const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "OfficeAI Dev";
pres.title = "OfficeAI 项目汇报";

const C = {
  navy: "1B1B2F", slate: "2D2D44", amber: "C9953C", ivory: "DAD5CC",
  cream: "F5F4F0", white: "FFFFFF", text: "1A1A2E", muted: "8A857C",
  green: "5B9A6B", red: "D4735A", blue: "5B7FA5", teal: "0D9488",
  gray: "E8E8E4",
};
const sh = () => ({ type: "outer", blur: 3, offset: 1.5, angle: 135, color: "000000", opacity: 0.08 });
const card = (s, x, y, w, h) => s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.white }, shadow: sh() });
const amber = (s, x, y) => s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.6, h: 0.03, fill: { color: C.amber } });
const hdr = (s, x, y, w, t) => { s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.38, fill: { color: C.navy } }); s.addText(t, { x: x + 0.15, y, w: w - 0.3, h: 0.38, fontSize: 11, color: C.white, bold: true, valign: "middle", margin: 0 }); };
const img = (s, x, y, w, h, label) => { s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.gray }, line: { color: "BBBBBB", width: 1, dashType: "dash" } }); s.addText(`[ 截图：${label} ]`, { x, y, w, h, fontSize: 11, color: C.muted, align: "center", valign: "middle" }); };
function footer(s, num) {
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.37, w: 10, h: 0.255, fill: { color: C.navy } });
  s.addText(`OfficeAI · ${num}`, { x: 9.0, y: 5.37, w: 0.7, h: 0.255, fontSize: 8, color: C.muted, valign: "middle", align: "center" });
}

// ════════════════════════════════════════
// SLIDE 1: Cover
// ════════════════════════════════════════
let s = pres.addSlide(); s.background = { color: C.navy };
s.addText("轻量企业办公 AI 助手", { x: 0.8, y: 1.3, w: 8.5, h: 1.1, fontSize: 40, fontFace: "Georgia", color: C.white, bold: true });
amber(s, 0.8, 2.55);
s.addText("项目开发汇报", { x: 0.8, y: 2.8, w: 8, h: 0.6, fontSize: 22, color: C.ivory });
s.addText("35 次提交 · 16 个源文件 · 5 套主题 · 零构建部署\nFastAPI + DeepSeek V4 + SQLite + 原生 HTML/CSS/JS", { x: 0.8, y: 3.6, w: 8, h: 0.7, fontSize: 13, color: C.muted, lineSpacing: 22 });

// ════════════════════════════════════════
// SLIDE 2: UI & Themes
// ════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.cream }; footer(s, 2);
s.addText("界面设计 & 5 套主题", { x: 0.5, y: 0.2, w: 6, h: 0.5, fontSize: 28, fontFace: "Georgia", color: C.navy, bold: true, margin: 0 }); amber(s, 0.5, 0.72);

img(s, 0.5, 1.0, 5.5, 3.2, "主界面 — 左右分栏聊天窗口");

// Themes
card(s, 6.2, 1.0, 3.4, 3.2); hdr(s, 6.2, 1.0, 3.4, "5 套主题");
const themes = [
  { n: "琥珀金", c1: "C9953C", c2: "1B1B1B" }, { n: "极致暗黑", c1: "FFFFFF", c2: "0D0D0D" },
  { n: "纯白", c1: "1A1A1A", c2: "FAFAF8" }, { n: "松木绿", c1: "7CB885", c2: "1A1F1C" },
  { n: "深海蓝", c1: "7AACCC", c2: "191D24" },
];
themes.forEach((t, i) => {
  const ty = 1.5 + i * 0.55;
  s.addShape(pres.shapes.OVAL, { x: 6.4, y: ty + 0.06, w: 0.35, h: 0.35, fill: { color: t.c1 } });
  s.addShape(pres.shapes.OVAL, { x: 6.6, y: ty + 0.06, w: 0.35, h: 0.35, fill: { color: t.c2 } });
  s.addText(t.n, { x: 7.15, y: ty, w: 2, h: 0.45, fontSize: 12, color: C.text, valign: "middle", margin: 0 });
});

// Interaction below
s.addText("交互亮点", { x: 0.5, y: 4.4, w: 3, h: 0.3, fontSize: 14, color: C.navy, bold: true, margin: 0 });
card(s, 0.5, 4.7, 9.1, 0.55);
s.addText("流式打字机效果  ·  弹跳圆点等待动效 + 进度条  ·  消息编辑 ✏️ + 复制 📋 + 下载 ⬇️  ·  拖拽上传  ·  768px 响应式  ·  工具切换防刷屏", { x: 0.7, y: 4.72, w: 8.7, h: 0.5, fontSize: 11, color: C.text, valign: "middle" });

// ════════════════════════════════════════
// SLIDE 3: Doc Summary — Feature
// ════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.cream }; footer(s, 3);
s.addText("功能：文档总结", { x: 0.5, y: 0.2, w: 6, h: 0.5, fontSize: 28, fontFace: "Georgia", color: C.navy, bold: true, margin: 0 }); amber(s, 0.5, 0.72);

img(s, 0.5, 1.0, 5.5, 2.6, "文档总结 — 上传文件 + 提问 + AI 回复");

// Pipeline
card(s, 6.2, 1.0, 3.4, 2.6); hdr(s, 6.2, 1.0, 3.4, "处理流程 & 支持格式");
const steps = [
  { n: "① 上传", c: C.navy }, { n: "② 解析", c: C.slate }, { n: "③ 安全", c: C.red }, { n: "④ 注入", c: C.blue }, { n: "⑤ 生成", c: C.amber },
];
steps.forEach((st, i) => {
  const px = 6.35 + i * 0.67;
  s.addShape(pres.shapes.RECTANGLE, { x: px, y: 1.5, w: 0.6, h: 0.6, fill: { color: st.c } });
  s.addText(st.n, { x: px, y: 1.5, w: 0.6, h: 0.6, fontSize: 9, color: C.white, bold: true, align: "center", valign: "middle" });
});
s.addText("支持: .txt  .docx  .md  .pdf\n安全: 5MB上限 · 100页PDF · 30s超时\n编码: UTF-8 → GBK → GB2312 自动检测\n输出: 摘要 · 关键要点 · 自定义提问", { x: 6.4, y: 2.25, w: 3.0, h: 1.2, fontSize: 10, color: C.text, lineSpacing: 20 });

// Implementation
s.addText("技术实现", { x: 0.5, y: 3.8, w: 3, h: 0.3, fontSize: 14, color: C.navy, bold: true, margin: 0 });
card(s, 0.5, 4.15, 9.1, 1.1);
s.addText([
  { text: "文件持久化: 上传 → SQLite sessions.file_text 存储 → 重启不丢失。后端从 SQLite 读取（非内存 dict），session_files 仅作缓存加速。", options: { bullet: true, breakLine: true } },
  { text: "上下文注入: 检测关键词（总结/文档/报告/提取/这份/版本/指标）→ 自动拼接文件全文到用户消息。doc_summary 强制模式下始终注入。", options: { bullet: true, breakLine: true } },
  { text: "解析器: asyncio.wait_for 超时控制 + ParseError 异常分类 + _truncate_if_needed 30000字截断 + 编码回退链。", options: { bullet: true } },
], { x: 0.7, y: 4.2, w: 8.7, h: 1.0, fontSize: 11, color: C.text, lineSpacing: 24 });

// ════════════════════════════════════════
// SLIDE 4: Doc Generator — Feature + Implementation
// ════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.cream }; footer(s, 4);
s.addText("功能：文案生成", { x: 0.5, y: 0.2, w: 6, h: 0.5, fontSize: 28, fontFace: "Georgia", color: C.navy, bold: true, margin: 0 }); amber(s, 0.5, 0.72);

img(s, 0.5, 1.0, 5.0, 2.3, "文案生成 — 模板卡片选择 + 输入 + 生成结果");

// Template cards
card(s, 5.7, 1.0, 3.9, 2.3); hdr(s, 5.7, 1.0, 3.9, "三套模板 + 使用示例");
const tpls = [
  { n: "📊 周报", f: "本周完成 · 下周计划 · 问题风险" },
  { n: "📋 会议纪要", f: "议题 · 决议 · 待办事项 · 责任人" },
  { n: "📢 工作通知", f: "通知对象 · 事项内容 · 时间 · 要求" },
];
tpls.forEach((t, i) => {
  const ty = 1.5 + i * 0.6;
  s.addShape(pres.shapes.RECTANGLE, { x: 5.85, y: ty, w: 3.6, h: 0.5, fill: { color: "FAFAF8" } });
  s.addShape(pres.shapes.RECTANGLE, { x: 5.85, y: ty, w: 0.04, h: 0.5, fill: { color: [C.amber, C.teal, C.blue][i] } });
  s.addText(t.n + "  " + t.f, { x: 6.0, y: ty, w: 3.3, h: 0.5, fontSize: 10, color: C.text, valign: "middle", margin: 0 });
});

// Implementation
s.addText("技术实现", { x: 0.5, y: 3.5, w: 3, h: 0.3, fontSize: 14, color: C.navy, bold: true, margin: 0 });
card(s, 0.5, 3.85, 9.1, 1.4);
s.addText([
  { text: "Jinja2 模板引擎: 默认 .j2 文件 + 用户自定义 (SQLite settings.templates) → doc_generator.py 加载优先级: 自定义 > 默认。", options: { bullet: true, breakLine: true } },
  { text: "模板编辑器: 设置面板展开 → 预填默认内容 → 修改保存到 SQLite → 下次生成使用自定义模板。清空文本框恢复默认。", options: { bullet: true, breakLine: true } },
  { text: "生成流程: 用户选择卡片 → 设置 currentTemplate → 输入内容 → 前端拼接 \"template_key: weekly_report\\n[内容]\" → 后端解析 → generate_prompt 渲染 → DeepSeek 流式输出。", options: { bullet: true, breakLine: true } },
  { text: "模板语法: {{ fields.get('字段名', '默认值') }} · 支持 Jinja2 完整语法 · 自定义 Prompt 引导 AI 润色方向。", options: { bullet: true } },
], { x: 0.7, y: 3.9, w: 8.7, h: 1.3, fontSize: 11, color: C.text, lineSpacing: 24 });

// ════════════════════════════════════════
// SLIDE 5: Web Search — Feature
// ════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.cream }; footer(s, 5);
s.addText("功能：联网检索", { x: 0.5, y: 0.2, w: 6, h: 0.5, fontSize: 28, fontFace: "Georgia", color: C.navy, bold: true, margin: 0 }); amber(s, 0.5, 0.72);

// RAG flow — wide
card(s, 0.5, 1.0, 9.1, 1.1); hdr(s, 0.5, 1.0, 9.1, "RAG 检索增强生成流程");
const flow = [
  { l: "用户提问\n\"最近一周AI新闻\"", c: C.navy },
  { l: "日期注入\n追加 2026-07-22", c: C.slate },
  { l: "Serper API\nGoogle 搜索\ntbs=qdr:w 时间过滤", c: C.teal },
  { l: "结果拼接\n注入 Prompt\n[搜索内容]", c: C.blue },
  { l: "DeepSeek\n整合生成\n流式输出+来源", c: C.amber },
];
flow.forEach((f, i) => {
  const fx = 0.7 + i * 1.85;
  s.addShape(pres.shapes.RECTANGLE, { x: fx, y: 1.5, w: 1.65, h: 0.5, fill: { color: f.c } });
  s.addText(f.l, { x: fx, y: 1.5, w: 1.65, h: 0.5, fontSize: 9, color: C.white, align: "center", valign: "middle", lineSpacing: 13 });
  if (i < 4) s.addText("→", { x: fx + 1.65, y: 1.55, w: 0.2, h: 0.3, fontSize: 16, color: C.amber });
});

img(s, 0.5, 2.3, 5.2, 2.0, "联网检索 — 搜索结果 + AI 生成回答");

// Search evolution + demo
card(s, 5.9, 2.3, 3.7, 2.0); hdr(s, 5.9, 2.3, 3.7, "方案演进");
s.addText("V1 DuckDuckGo → 国内被屏蔽\nV2 Bing HTML 抓取 → 中文差\nV3 Serper API → Google 质量\n  + 缓存 TTL 1h + LRU 100条\n  + 冷却 3s + 故障自动切换", { x: 6.05, y: 2.75, w: 3.4, h: 1.4, fontSize: 9.5, color: C.text, lineSpacing: 18 });

// Implementation
s.addText("技术实现", { x: 0.5, y: 4.5, w: 3, h: 0.3, fontSize: 14, color: C.navy, bold: true, margin: 0 });
card(s, 0.5, 4.85, 9.1, 0.4);
s.addText("策略模式: SearchBackend 抽象 → BingBackend / SerperBackend · SearchManager 统一调度（缓存+冷却+故障切换） · 搜索不走 Function Calling → 直接注入 Prompt → 单次 API 调用 → 无 XML 泄露", { x: 0.7, y: 4.85, w: 8.7, h: 0.4, fontSize: 11, color: C.text, valign: "middle" });

// ════════════════════════════════════════
// SLIDE 6: Architecture
// ════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.cream }; footer(s, 6);
s.addText("技术架构", { x: 0.5, y: 0.2, w: 6, h: 0.5, fontSize: 28, fontFace: "Georgia", color: C.navy, bold: true, margin: 0 }); amber(s, 0.5, 0.72);

const arch = [
  { l: "浏览器", d: "HTML/CSS/JS + SSE · 5 套主题 (data-theme) · 模板卡片 · 拖拽上传 · DOMPurify XSS", c: C.navy, top: 1.0 },
  { l: "FastAPI 路由", d: "GET / · POST /chat (SSE) · POST /upload · GET /templates · GET/POST /settings · POST /clear-memory", c: C.slate, top: 1.6 },
  { l: "Agent 核心 (agent/core.py)", d: "chat_with_tools: 工具调度 + 流式输出 + 重试 · 用户动态 API 配置 (SQLite) · 文件上下文注入", c: C.blue, top: 2.2 },
  { l: "工具模块 (tools/)", d: "doc_parser.py (txt/docx/md/pdf) | doc_generator.py (Jinja2+自定义) | web_search.py (策略模式)", c: C.teal, top: 2.8 },
  { l: "记忆系统 (agent/memory.py)", d: "SQLite (WAL+asyncio.Lock) · MemoryManager · 滑动窗口 10轮 · 异步摘要压缩 · 7天清理 · 用户设置", c: C.green, top: 3.4 },
  { l: "DeepSeek V4 API", d: "OpenAI 兼容 SDK (AsyncOpenAI) · 动态 api_key/api_base/model · 配置 SQLite → .env 回退", c: C.amber, top: 4.0 },
];
arch.forEach((a) => {
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: a.top, w: 9.1, h: 0.5, fill: { color: a.c } });
  s.addText(a.l, { x: 0.7, y: a.top + 0.04, w: 4.5, h: 0.2, fontSize: 12, color: C.white, bold: true, margin: 0 });
  s.addText(a.d, { x: 0.7, y: a.top + 0.26, w: 8.7, h: 0.2, fontSize: 9, color: C.ivory, margin: 0 });
});

// Tech stack + highlights at bottom
const techs = ["python-docx", "pdfplumber", "Jinja2", "httpx", "Serper", "SQLite", "DOMPurify", "marked.js"];
techs.forEach((t, i) => {
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5 + i * 1.15, y: 4.65, w: 1.05, h: 0.3, fill: { color: C.white }, shadow: sh() });
  s.addText(t, { x: 0.5 + i * 1.15, y: 4.65, w: 1.05, h: 0.3, fontSize: 9, color: C.text, align: "center", valign: "middle" });
});

card(s, 0.5, 5.0, 9.1, 0.25);
s.addText("搜索方案4次演进 · Python3.8兼容 · 零构建(python app.py) · 策略模式 · 35次原子提交 · 3轮设计审查", { x: 0.7, y: 5.0, w: 8.7, h: 0.25, fontSize: 10, color: C.text, valign: "middle" });

// ════════════════════════════════════════
// SLIDE 7: Settings & Memory
// ════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.cream }; footer(s, 7);
s.addText("设置面板 & 记忆系统", { x: 0.5, y: 0.2, w: 7, h: 0.5, fontSize: 28, fontFace: "Georgia", color: C.navy, bold: true, margin: 0 }); amber(s, 0.5, 0.72);

// Left: settings
card(s, 0.5, 1.0, 4.3, 2.6); hdr(s, 0.5, 1.0, 4.3, "设置面板");
s.addText("API 配置\n  Base URL / API Key / Model\n  动态切换 · 即时生效 · 空值回退 .env\n\n主题切换\n  5 套主题 CSS 变量即时预览\n  data-theme 属性驱动 · 保存到 SQLite\n\n模板编辑器\n  周报 / 纪要 / 通知 三套模板\n  点击展开 → 预填默认 → 修改保存\n  清空文本框恢复默认 · Jinja2 语法", { x: 0.7, y: 1.5, w: 3.9, h: 2.0, fontSize: 11, color: C.text, lineSpacing: 20 });

// Right: memory
card(s, 5.0, 1.0, 4.6, 2.6); hdr(s, 5.0, 1.0, 4.6, "上下文记忆系统");
s.addText("滑动窗口\n  保留最近 10 轮完整对话\n  超限裁剪 history[-max_msgs:]\n\n摘要压缩\n  触发: rounds > 10\n  异步后台 (asyncio.create_task)\n  不阻塞当前请求\n  从 DB 重读防竞态\n\nSQLite 持久化\n  WAL 模式 · asyncio.Lock\n  7天自动清理 · shutdown 关连接\n  重启不丢失", { x: 5.2, y: 1.5, w: 4.2, h: 2.0, fontSize: 11, color: C.text, lineSpacing: 19 });

// Bottom: screenshot
img(s, 0.5, 3.8, 9.1, 1.45, "设置面板 + 模板编辑器界面");

// ════════════════════════════════════════
// SLIDE 8: Summary
// ════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.navy };
s.addText("项目总结", { x: 0.8, y: 0.4, w: 8, h: 0.7, fontSize: 34, fontFace: "Georgia", color: C.white, bold: true }); amber(s, 0.8, 1.1);

const stats = [
  { v: "35", l: "次提交" }, { v: "16", l: "源文件" }, { v: "5", l: "套主题" }, { v: "3", l: "大工具" },
];
stats.forEach((st, i) => {
  const sx = 0.8 + i * 2.25;
  s.addText(st.v, { x: sx, y: 1.4, w: 1.8, h: 0.7, fontSize: 42, color: C.amber, bold: true, fontFace: "Georgia", align: "center" });
  s.addText(st.l, { x: sx, y: 2.1, w: 1.8, h: 0.3, fontSize: 13, color: C.muted, align: "center" });
});

// Three columns
const cols = [
  { t: "功能交付", items: ["文档总结: 4格式+安全+SQLite", "文案生成: 3模板+卡片+自定义", "联网检索: Serper+RAG+时间过滤", "上下文记忆: 窗口+压缩+WAL", "设置面板: API+主题+模板编辑"] },
  { t: "UI / UX", items: ["5套主题系统(CSS变量+即时切换)", "等待动效: 圆点+进度条+状态", "消息编辑·复制·下载(SVG图标)", "模板卡片化·拖拽上传·响应式", "工具切换防刷屏·清除聊天"] },
  { t: "工程质量", items: ["搜索方案4次演进+XML踩坑修复", "Python3.8+Windows兼容适配", "DOMPurify XSS·SQLite并发安全", "35次原子提交·3轮设计审查", "零构建: python app.py 一键启动"] },
];
cols.forEach((col, i) => {
  const sx = 0.3 + i * 3.25;
  s.addShape(pres.shapes.RECTANGLE, { x: sx, y: 2.7, w: 0.06, h: 2.0, fill: { color: C.amber } });
  s.addText(col.t, { x: sx + 0.2, y: 2.7, w: 2.8, h: 0.35, fontSize: 14, color: C.ivory, bold: true, margin: 0 });
  col.items.forEach((item, j) => {
    s.addText(item, { x: sx + 0.2, y: 3.1 + j * 0.32, w: 2.9, h: 0.28, fontSize: 10, color: C.muted, bullet: true });
  });
});

s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.0, w: 10, h: 0.625, fill: { color: "141428" } });
s.addText("python app.py  —  一键启动  ·  零构建  ·  http://localhost:8000", { x: 1, y: 5.0, w: 8, h: 0.625, fontSize: 16, color: C.amber, valign: "middle", align: "center" });

// ── Write ──
const out = "g:/Heracles/TF/docs/OfficeAI_项目汇报_v5.pptx";
pres.writeFile({ fileName: out }).then(() => console.log("Done: " + out));
