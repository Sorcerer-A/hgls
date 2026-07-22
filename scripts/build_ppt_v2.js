const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "OfficeAI Dev";
pres.title = "轻量企业办公 AI 助手 — 项目汇报 V2";

const C = {
  navy: "1B1B2F", slate: "2D2D44", amber: "C9953C", ivory: "DAD5CC",
  cream: "F5F4F0", white: "FFFFFF", text: "1A1A2E", muted: "8A857C",
  green: "5B9A6B", red: "D4735A", blue: "5B7FA5", teal: "0D9488",
};

const mkShadow = () => ({ type: "outer", blur: 4, offset: 2, angle: 135, color: "000000", opacity: 0.1 });
const mkShadowLg = () => ({ type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.15 });

function addSlideNum(slide, num) {
  slide.addText(String(num), { x: 9.2, y: 5.1, w: 0.5, h: 0.3, fontSize: 9, color: C.muted, align: "center" });
}
function addFooter(slide, num) {
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.34, w: 10, h: 0.285, fill: { color: C.navy } });
  slide.addText("OfficeAI · 轻量企业办公助手 · 项目汇报 V2", { x: 0.5, y: 5.34, w: 8, h: 0.285, fontSize: 7.5, color: C.muted, valign: "middle" });
  addSlideNum(slide, num);
}
function amberLine(slide, x, y) { slide.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.8, h: 0.04, fill: { color: C.amber } }); }
function card(slide, x, y, w, h) { slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.white }, shadow: mkShadow() }); }

// ═══ Slide 1: Cover ═══
let s1 = pres.addSlide();
s1.background = { color: C.navy };
s1.addText("轻量企业办公 AI 助手", { x: 1, y: 1.1, w: 8, h: 1.1, fontSize: 38, fontFace: "Georgia", color: C.white, bold: true });
s1.addShape(pres.shapes.RECTANGLE, { x: 1, y: 2.35, w: 1.2, h: 0.05, fill: { color: C.amber } });
s1.addText("项目开发汇报 V2 · 功能演示与 UI 设计", { x: 1, y: 2.6, w: 8, h: 0.6, fontSize: 20, color: C.ivory });
s1.addText("35 次提交 · 5 套主题 · 3 大工具 · 零构建部署", { x: 1, y: 3.5, w: 8, h: 0.5, fontSize: 14, color: C.muted });
s1.addText("FastAPI + DeepSeek V4 + SQLite + Vanilla JS", { x: 1, y: 4.2, w: 8, h: 0.4, fontSize: 12, color: C.muted });

// ═══ Slide 2: UI Design ═══
let s2 = pres.addSlide();
s2.background = { color: C.cream };
addFooter(s2, 2);
s2.addText("界面设计", { x: 0.5, y: 0.25, w: 6, h: 0.55, fontSize: 28, fontFace: "Georgia", color: C.navy, bold: true, margin: 0 });
amberLine(s2, 0.5, 0.85);

// Layout mockup
card(s2, 0.5, 1.15, 3.5, 3.8);
s2.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.15, w: 0.9, h: 3.8, fill: { color: C.navy } });
s2.addText("侧\n边\n栏", { x: 0.52, y: 1.8, w: 0.85, h: 1.5, fontSize: 11, color: C.ivory, align: "center", valign: "middle" });
s2.addShape(pres.shapes.RECTANGLE, { x: 1.4, y: 1.15, w: 2.6, h: 3.8, fill: { color: "F0F0EB" } });
s2.addText("聊天区\n\n用户消息 ██\nAI 回复   ░░\n\n┌──────────┐\n│ 输入框...  │ 发送 │\n└──────────┘", { x: 1.5, y: 1.3, w: 2.4, h: 3.4, fontSize: 9, color: C.text, valign: "top" });

// Theme previews
s2.addText("5 套主题", { x: 4.3, y: 1.15, w: 5.2, h: 0.35, fontSize: 14, color: C.navy, bold: true, margin: 0 });
const themes = [
  { n: "琥珀金", c1: "C9953C", c2: "1B1B1B" },
  { n: "暗黑", c1: "FFFFFF", c2: "0D0D0D" },
  { n: "纯白", c1: "1A1A1A", c2: "FAFAF8" },
  { n: "松木绿", c1: "7CB885", c2: "1A1F1C" },
  { n: "深海蓝", c1: "7AACCC", c2: "191D24" },
];
themes.forEach((t, i) => {
  const ty = 1.6 + i * 0.7;
  s2.addShape(pres.shapes.RECTANGLE, { x: 4.3, y: ty, w: 5.2, h: 0.6, fill: { color: C.white }, shadow: mkShadow() });
  s2.addShape(pres.shapes.OVAL, { x: 4.5, y: ty + 0.1, w: 0.4, h: 0.4, fill: { color: t.c1 } });
  s2.addShape(pres.shapes.OVAL, { x: 4.75, y: ty + 0.1, w: 0.4, h: 0.4, fill: { color: t.c2 } });
  s2.addText(t.n, { x: 5.3, y: ty, w: 3, h: 0.6, fontSize: 12, color: C.text, valign: "middle", margin: 0 });
});

// Interaction highlights
s2.addText("交互细节", { x: 0.5, y: 5.05, w: 4, h: 0.25, fontSize: 11, color: C.navy, bold: true, margin: 0 });
["流式打字机效果 · 消息编辑 ✏️ · 复制 📋 · 下载 ⬇️", "等待动效: 跳动圆点 + 进度条 + 状态文字", "拖拽上传文件 · 768px 响应式断点"].forEach((t, i) => {
  s2.addText(t, { x: 0.5, y: 4.75 + i * 0.28, w: 9, h: 0.25, fontSize: 9, color: C.text, bullet: true });
});

// ═══ Slide 3: Doc Summary ═══
let s3 = pres.addSlide();
s3.background = { color: C.cream };
addFooter(s3, 3);
s3.addText("功能演示：文档总结", { x: 0.5, y: 0.25, w: 7, h: 0.55, fontSize: 28, fontFace: "Georgia", color: C.navy, bold: true, margin: 0 });
amberLine(s3, 0.5, 0.85);

// Input
card(s3, 0.5, 1.1, 4.2, 1.6);
s3.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.1, w: 4.2, h: 0.35, fill: { color: C.teal } });
s3.addText("📎 上传文档", { x: 0.6, y: 1.1, w: 3.8, h: 0.35, fontSize: 11, color: C.white, bold: true, valign: "middle", margin: 0 });
s3.addText("格式: txt / docx / md / pdf\n大小: ≤5MB  PDF页数: ≤100\n解析超时: 30s 安全限制", { x: 0.7, y: 1.55, w: 3.8, h: 1.0, fontSize: 10, color: C.text, lineSpacing: 18 });

// Questions
card(s3, 5.0, 1.1, 4.5, 1.6);
s3.addShape(pres.shapes.RECTANGLE, { x: 5.0, y: 1.1, w: 4.5, h: 0.35, fill: { color: C.amber } });
s3.addText("💬 提问示例", { x: 5.1, y: 1.1, w: 4.1, h: 0.35, fontSize: 11, color: C.white, bold: true, valign: "middle", margin: 0 });
["请用 100 字总结这份报告", "列出 Q3 四个版本号及更新内容", "提取所有数字指标，用表格展示", "竞品分析中提到了哪几款竞品？"].forEach((q, i) => {
  s3.addText(q, { x: 5.2, y: 1.55 + i * 0.28, w: 4, h: 0.25, fontSize: 9.5, color: C.text, bullet: true });
});

// Output demo
card(s3, 0.5, 2.9, 9, 2.2);
s3.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 2.9, w: 9, h: 0.35, fill: { color: C.navy } });
s3.addText("📄 输出示例：100 字摘要 + 版本列表 + 指标表格", { x: 0.6, y: 2.9, w: 8.6, h: 0.35, fontSize: 11, color: C.white, bold: true, valign: "middle", margin: 0 });
s3.addText([
  { text: "V2.3.0 · 文档解析重构，性能 ↑3x · V2.4.0 · 联网检索增强，匹配率 61%→87%", options: { breakLine: true } },
  { text: "V2.5.0 · 模板自定义编辑器 · V2.6.0 · 多会话管理+历史搜索", options: { breakLine: true } },
  { text: "注册增长 47% | 日活增长 62% | 月收入 86 万元 | 用户满意度 4.4/5", options: {} },
], { x: 0.7, y: 3.35, w: 8.6, h: 1.5, fontSize: 11, color: C.text, lineSpacing: 24 });

// ═══ Slide 4: Doc Generator ═══
let s4 = pres.addSlide();
s4.background = { color: C.cream };
addFooter(s4, 4);
s4.addText("功能演示：文案生成", { x: 0.5, y: 0.25, w: 7, h: 0.55, fontSize: 28, fontFace: "Georgia", color: C.navy, bold: true, margin: 0 });
amberLine(s4, 0.5, 0.85);

// Template cards
["📊 周报 — 本周完成 · 下周计划 · 问题风险", "📋 会议纪要 — 议题 · 决议 · 待办事项 · 责任人", "📢 工作通知 — 通知对象 · 事项内容 · 时间 · 要求"].forEach((t, i) => {
  const x = 0.5 + i * 3.15;
  card(s4, x, 1.1, 2.95, 0.8);
  s4.addShape(pres.shapes.RECTANGLE, { x, y: 1.1, w: 0.06, h: 0.8, fill: { color: [C.amber, C.teal, C.blue][i] } });
  const parts = t.split("—");
  s4.addText(parts[0], { x: x + 0.2, y: 1.15, w: 2.5, h: 0.3, fontSize: 12, color: C.navy, bold: true, margin: 0 });
  s4.addText(parts[1] || "", { x: x + 0.2, y: 1.5, w: 2.5, h: 0.3, fontSize: 9, color: C.muted, margin: 0 });
});

// Input → Output demo
s4.addText("输入（周报示例）", { x: 0.5, y: 2.1, w: 4, h: 0.25, fontSize: 12, color: C.navy, bold: true, margin: 0 });
card(s4, 0.5, 2.4, 4.2, 2.6);
s4.addText("本周完成：用户登录模块重构\n下周计划：支付模块对接\n问题风险：SDK版本过旧", { x: 0.7, y: 2.5, w: 3.8, h: 2.3, fontSize: 10, color: C.text, fontFace: "Consolas", lineSpacing: 20 });

s4.addText("→", { x: 4.5, y: 3.4, w: 1, h: 0.5, fontSize: 28, color: C.amber, align: "center", valign: "middle" });

s4.addText("输出（AI 生成）", { x: 5.5, y: 2.1, w: 4, h: 0.25, fontSize: 12, color: C.navy, bold: true, margin: 0 });
card(s4, 5.5, 2.4, 4, 2.6);
s4.addText("## 周报（2026.07.22）\n### 一、本周完成\n- 用户登录模块重构\n### 二、下周计划\n- 支付模块对接\n### 三、问题与风险\n- SDK版本过旧需升级", { x: 5.7, y: 2.5, w: 3.6, h: 2.3, fontSize: 10, color: C.text, lineSpacing: 18 });

// ═══ Slide 5: Web Search ═══
let s5 = pres.addSlide();
s5.background = { color: C.cream };
addFooter(s5, 5);
s5.addText("功能演示：联网检索", { x: 0.5, y: 0.25, w: 7, h: 0.55, fontSize: 28, fontFace: "Georgia", color: C.navy, bold: true, margin: 0 });
amberLine(s5, 0.5, 0.85);

// Architecture diagram
s5.addText("RAG 检索增强生成流程", { x: 0.5, y: 1.1, w: 9, h: 0.3, fontSize: 13, color: C.navy, bold: true, margin: 0 });

const steps = [
  { label: "用户提问", desc: "\"最近一周\nAI新闻\"", color: C.navy },
  { label: "日期注入", desc: "追加\n2026-07-22", color: C.slate },
  { label: "Serper API", desc: "Google 搜索\ntbs=qdr:w", color: C.teal },
  { label: "结果注入", desc: "拼接到\nPrompt", color: C.blue },
  { label: "DeepSeek", desc: "整合生成\n流式输出", color: C.amber },
];
steps.forEach((s, i) => {
  const sx = 0.3 + i * 1.95;
  s5.addShape(pres.shapes.RECTANGLE, { x: sx, y: 1.55, w: 1.75, h: 1.55, fill: { color: s.color } });
  s5.addText(s.label, { x: sx, y: 1.65, w: 1.75, h: 0.45, fontSize: 12, color: C.white, bold: true, align: "center", margin: 0 });
  s5.addText(s.desc, { x: sx, y: 2.15, w: 1.75, h: 0.8, fontSize: 9.5, color: C.ivory, align: "center", lineSpacing: 16 });
  if (i < 4) s5.addText("→", { x: sx + 1.75, y: 2.0, w: 0.2, h: 0.4, fontSize: 18, color: C.amber, align: "center", valign: "middle" });
});

// Demo results
card(s5, 0.5, 3.35, 9, 1.75);
s5.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.35, w: 9, h: 0.35, fill: { color: C.navy } });
s5.addText("🔍 输出示例：联网检索结果", { x: 0.6, y: 3.35, w: 8.6, h: 0.35, fontSize: 11, color: C.white, bold: true, valign: "middle", margin: 0 });
s5.addText([
  { text: "本周热点 (截至2026.07.22)：", options: { bold: true, breakLine: true } },
  { text: "1. The Guardian (7/20) — 中国 AI 芯片进展引发硅谷关注", options: { breakLine: true } },
  { text: "2. 习近平发起新 AI 联盟，推动开源战略", options: { breakLine: true } },
  { text: "3. 国产算力系统跨集群技术突破 (WAIC 首发)", options: { breakLine: true } },
  { text: "✨ 日期注入 + tbs=qdr:w 时间过滤 = 近一周结果", options: { breakLine: true } },
  { text: "⚡ 搜索延迟 ~2s，首字响应快于自由对话", options: {} },
], { x: 0.7, y: 3.8, w: 8.4, h: 1.2, fontSize: 10, color: C.text, lineSpacing: 18 });

// ═══ Slide 6: Settings & Memory ═══
let s6 = pres.addSlide();
s6.background = { color: C.cream };
addFooter(s6, 6);
s6.addText("设置面板 & 记忆系统", { x: 0.5, y: 0.25, w: 7, h: 0.55, fontSize: 28, fontFace: "Georgia", color: C.navy, bold: true, margin: 0 });
amberLine(s6, 0.5, 0.85);

// Settings panel mockup
card(s6, 0.5, 1.1, 4.2, 3.8);
s6.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.1, w: 4.2, h: 0.35, fill: { color: C.navy } });
s6.addText("⚙️ 设置面板", { x: 0.6, y: 1.1, w: 3.8, h: 0.35, fontSize: 11, color: C.white, bold: true, valign: "middle", margin: 0 });
const settingsItems = [
  "API 配置: Base URL / API Key / Model",
  "→ 支持任意兼容 OpenAI SDK 的大模型",
  "→ 修改即时生效，无需重启",
  "5 套主题一键切换",
  "→ 琥珀金 · 暗黑 · 纯白 · 松木绿 · 深海蓝",
  "模板编辑器",
  "→ 周报 / 会议纪要 / 工作通知 Jinja2 模板",
  "→ 点击展开编辑，保存即时生效",
  "→ 默认模板自动填充，方便修改",
];
settingsItems.forEach((item, i) => {
  s6.addText(item, { x: 0.7, y: 1.55 + i * 0.32, w: 3.8, h: 0.3, fontSize: 9.5, color: C.text, bullet: item.startsWith("→") ? false : true });
});

// Memory system
card(s6, 5.0, 1.1, 4.5, 3.8);
s6.addShape(pres.shapes.RECTANGLE, { x: 5.0, y: 1.1, w: 4.5, h: 0.35, fill: { color: C.teal } });
s6.addText("🧠 上下文记忆系统", { x: 5.1, y: 1.1, w: 4.1, h: 0.35, fontSize: 11, color: C.white, bold: true, valign: "middle", margin: 0 });
const memItems = [
  "滑动窗口: 保留最近 10 轮完整对话",
  "摘要压缩: 超过 10 轮 → 异步后台压缩",
  "→ 最早 5 轮压缩为 1-2 句摘要",
  "→ 不阻塞当前请求，用户无感知",
  "SQLite 持久化 (WAL 模式)",
  "→ 重启不丢失",
  "→ asyncio.Lock 协程级并发控制",
  "7 天自动清理过期会话",
  "+ 新对话 / 清除聊天",
];
memItems.forEach((item, i) => {
  s6.addText(item, { x: 5.2, y: 1.55 + i * 0.35, w: 4, h: 0.32, fontSize: 9.5, color: C.text, bullet: item.startsWith("→") ? false : true });
});

// ═══ Slide 7: Architecture ═══
let s7 = pres.addSlide();
s7.background = { color: C.cream };
addFooter(s7, 7);
s7.addText("技术架构", { x: 0.5, y: 0.25, w: 6, h: 0.55, fontSize: 28, fontFace: "Georgia", color: C.navy, bold: true, margin: 0 });
amberLine(s7, 0.5, 0.85);

const archLayers = [
  { label: "浏览器", desc: "HTML/CSS/JS · SSE 流式 · 5 套主题 · 模板卡片 · 拖拽上传 · 消息编辑", color: C.navy, top: 1.1, h: 0.55 },
  { label: "FastAPI 路由 ( /chat /upload /templates /settings /clear-memory )", desc: "SSE StreamingResponse · 文件上传 + 解析 · 设置存取", color: C.slate, top: 1.82, h: 0.47 },
  { label: "Agent 核心", desc: "Function Calling · 工具调度 · 流式输出 · 指数退避重试 · 直接流式（自由对话优化）", color: C.blue, top: 2.43, h: 0.47 },
  { label: "工具模块 + 记忆系统", desc: "文档解析器 (docx/pdf) | Jinja2 文案生成 | Serper 检索 | SQLite 记忆 (WAL+Lock)", color: C.teal, top: 3.04, h: 0.47 },
  { label: "DeepSeek V4 API", desc: "OpenAI 兼容 SDK · 动态 API Key/Model 切换 · 用户自定义配置", color: C.amber, top: 3.65, h: 0.52 },
];

archLayers.forEach((l) => {
  s7.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: l.top, w: 9, h: l.h, fill: { color: l.color } });
  s7.addText(l.label, { x: 0.7, y: l.top + 0.05, w: 5.5, h: 0.22, fontSize: 12, color: C.white, bold: true, margin: 0 });
  s7.addText(l.desc, { x: 0.7, y: l.top + 0.28, w: 8.5, h: 0.18, fontSize: 9, color: C.ivory, margin: 0 });
});

// Tech stack
const techs = ["python-docx", "pdfplumber", "Jinja2", "httpx", "Serper", "SQLite", "DOMPurify", "marked.js"];
techs.forEach((t, i) => {
  s7.addShape(pres.shapes.RECTANGLE, { x: 0.5 + i * 1.15, y: 4.35, w: 1.05, h: 0.28, fill: { color: C.white }, shadow: mkShadow() });
  s7.addText(t, { x: 0.5 + i * 1.15, y: 4.35, w: 1.05, h: 0.28, fontSize: 8.5, color: C.text, align: "center", valign: "middle" });
});

// Highlights
s7.addText("工程亮点", { x: 0.5, y: 4.8, w: 2, h: 0.25, fontSize: 12, color: C.navy, bold: true, margin: 0 });
["搜索方案 4 次演进: DDG → Bing HTML → Serper API → RAG 注入", "Python 3.8 + Node.js 兼容 · 策略模式后端可插拔", "XML 泄露踩坑修复 · 递归 Function Calling → 直接流式优化"].forEach((h, i) => {
  s7.addText(h, { x: 0.5 + (i % 2) * 4.5, y: 5.05 + Math.floor(i / 2) * 0.22, w: 4.3, h: 0.2, fontSize: 9, color: C.text, bullet: true });
});

// ═══ Slide 8: Summary ═══
let s8 = pres.addSlide();
s8.background = { color: C.navy };
s8.addText("总结", { x: 1, y: 0.8, w: 8, h: 0.7, fontSize: 34, fontFace: "Georgia", color: C.white, bold: true });
s8.addShape(pres.shapes.RECTANGLE, { x: 1, y: 1.55, w: 1.2, h: 0.04, fill: { color: C.amber } });

// Stats
const stats = [
  { v: "35", l: "次提交" },
  { v: "16", l: "个源文件" },
  { v: "5", l: "套主题" },
  { v: "3", l: "大工具" },
];
stats.forEach((s, i) => {
  const sx = 1 + i * 2.2;
  s8.addText(s.v, { x: sx, y: 1.9, w: 1.8, h: 0.7, fontSize: 40, color: C.amber, bold: true, fontFace: "Georgia", align: "center" });
  s8.addText(s.l, { x: sx, y: 2.6, w: 1.8, h: 0.3, fontSize: 13, color: C.muted, align: "center" });
});

s8.addText([
  { text: "核心交付", options: { bold: true, fontSize: 16, color: C.ivory, breakLine: true } },
  { text: "文档总结 + 文案生成 + 联网检索 + 上下文记忆", options: { breakLine: true, fontSize: 13, color: C.muted } },
  { text: "", options: { breakLine: true, fontSize: 8 } },
  { text: "用户体验", options: { bold: true, fontSize: 16, color: C.ivory, breakLine: true } },
  { text: "5 套主题 · 等待动效 · 消息编辑 · SVG 图标 · 拖拽上传 · 响应式", options: { breakLine: true, fontSize: 13, color: C.muted } },
  { text: "", options: { breakLine: true, fontSize: 8 } },
  { text: "工程品质", options: { bold: true, fontSize: 16, color: C.ivory, breakLine: true } },
  { text: "35 次原子提交 · 3 轮设计审查 · 搜索 4 次演进 · XSS 防护 · 降级策略", options: { fontSize: 13, color: C.muted } },
], { x: 1, y: 3.1, w: 8, h: 2 });

s8.addText("python app.py", { x: 2.5, y: 5.0, w: 5, h: 0.5, fontSize: 22, color: C.amber, fontFace: "Consolas", bold: true, align: "center" });

// ── Write ──
const outFile = "g:/Heracles/TF/docs/OfficeAI_项目汇报_v3.pptx";
pres.writeFile({ fileName: outFile }).then(() => console.log("Done: " + outFile));
