const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "OfficeAI Dev";
pres.title = "轻量企业办公 AI 助手 — 项目汇报";

// ── Color Palette ───────────────────────────
const C = {
  navy:    "1B1B2F",
  slate:   "2D2D44",
  amber:   "C9953C",
  ivory:   "DAD5CC",
  cream:   "F5F4F0",
  white:   "FFFFFF",
  text:    "1A1A2E",
  muted:   "8A857C",
  green:   "5B9A6B",
  red:     "D4735A",
  blue:    "5B7FA5",
};

// ── Helpers ─────────────────────────────────
const mkShadow = () => ({ type: "outer", blur: 4, offset: 2, angle: 135, color: "000000", opacity: 0.1 });

function addSlideNum(slide, num) {
  slide.addText(String(num), { x: 9.2, y: 5.1, w: 0.5, h: 0.3, fontSize: 9, color: C.muted, align: "center" });
}

function addFooter(slide, num) {
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.35, w: 10, h: 0.275, fill: { color: C.navy } });
  slide.addText("OfficeAI · 轻量企业办公助手", { x: 0.5, y: 5.35, w: 5, h: 0.275, fontSize: 8, color: C.muted, valign: "middle" });
  addSlideNum(slide, num);
}

function cardBg(slide, x, y, w, h) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.white }, shadow: mkShadow() });
}

// ═════════════════════════════════════════════
// Slide 1: Title
// ═════════════════════════════════════════════
let s1 = pres.addSlide();
s1.background = { color: C.navy };
s1.addText("轻量企业办公 AI 助手", { x: 1, y: 1.3, w: 8, h: 1.2, fontSize: 40, fontFace: "Georgia", color: C.white, bold: true });
s1.addShape(pres.shapes.RECTANGLE, { x: 1, y: 2.6, w: 1.2, h: 0.05, fill: { color: C.amber } });
s1.addText("项目开发汇报", { x: 1, y: 2.85, w: 8, h: 0.7, fontSize: 22, color: C.ivory, fontFace: "Calibri" });
s1.addText([
  { text: "Python FastAPI + DeepSeek V4 + SQLite + Vanilla JS", options: { breakLine: true } },
  { text: "2026年7月 · 27 次提交 · 16 个源文件", options: {} },
], { x: 1, y: 3.8, w: 8, h: 0.8, fontSize: 13, color: C.muted });

// ═════════════════════════════════════════════
// Slide 2: Project Overview
// ═════════════════════════════════════════════
let s2 = pres.addSlide();
s2.background = { color: C.cream };
addFooter(s2, 2);
s2.addText("项目概述", { x: 0.7, y: 0.3, w: 8, h: 0.6, fontSize: 30, fontFace: "Georgia", color: C.navy, bold: true, margin: 0 });
s2.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 0.95, w: 0.8, h: 0.04, fill: { color: C.amber } });

// Metrics row
const metrics = [
  { label: "代码提交", value: "27 次" },
  { label: "源文件", value: "16 个" },
  { label: "后端", value: "FastAPI" },
  { label: "大模型", value: "DeepSeek V4" },
];
metrics.forEach((m, i) => {
  const x = 0.7 + i * 2.25;
  cardBg(s2, x, 1.3, 2.0, 1.1);
  s2.addText(m.value, { x, y: 1.4, w: 2.0, h: 0.55, fontSize: 22, color: C.amber, bold: true, align: "center", fontFace: "Georgia" });
  s2.addText(m.label, { x, y: 1.95, w: 2.0, h: 0.3, fontSize: 11, color: C.muted, align: "center" });
});

// Description
s2.addText([
  { text: "基于大模型 API 的轻量办公 Agent，", options: { breakLine: true } },
  { text: "内置文档总结、文案生成、联网检索三大工具，", options: { breakLine: true } },
  { text: "配以简约 Web 聊天界面。支持动态切换模型、", options: { breakLine: true } },
  { text: "5 套主题、自定义文案模板。", options: {} },
], { x: 0.7, y: 2.7, w: 8.5, h: 1.6, fontSize: 14, color: C.text, lineSpacing: 28 });

// Features chips
const chips = ["文档总结", "文案生成", "联网检索", "上下文记忆", "5套主题", "模板自定义"];
chips.forEach((c, i) => {
  const cx = 0.7 + (i % 3) * 2.8;
  const cy = 4.1 + Math.floor(i / 3) * 0.45;
  s2.addShape(pres.shapes.RECTANGLE, { x: cx, y: cy, w: 2.4, h: 0.35, fill: { color: C.navy } });
  s2.addText(c, { x: cx, y: cy, w: 2.4, h: 0.35, fontSize: 11, color: C.white, align: "center", valign: "middle" });
});

// ═════════════════════════════════════════════
// Slide 3: Core Features
// ═════════════════════════════════════════════
let s3 = pres.addSlide();
s3.background = { color: C.cream };
addFooter(s3, 3);
s3.addText("核心功能", { x: 0.7, y: 0.3, w: 8, h: 0.6, fontSize: 30, fontFace: "Georgia", color: C.navy, bold: true, margin: 0 });
s3.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 0.95, w: 0.8, h: 0.04, fill: { color: C.amber } });

const features = [
  { title: "文档总结", desc: "支持 txt/docx/md/pdf 四种格式\n自动编码检测，安全解析限制\n摘要 + 关键要点 + 自定义提问", color: C.blue },
  { title: "文案生成", desc: "三套内置模板：周报/纪要/通知\n模板卡片化选择，点击即用\n用户可自定义 Jinja2 模板", color: C.green },
  { title: "联网检索", desc: "Serper API (Google) 高质量搜索\nRAG 模式：搜索 → 注入 → 整合\n双后端策略，自动故障切换", color: C.amber },
  { title: "上下文记忆", desc: "滑动窗口 10 轮 + 摘要压缩\nSQLite 持久化，重启不丢失\n异步后台压缩，不阻塞用户", color: C.red },
];

features.forEach((f, i) => {
  const x = 0.5 + (i % 2) * 4.6;
  const y = 1.2 + Math.floor(i / 2) * 1.85;
  cardBg(s3, x, y, 4.3, 1.65);
  s3.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.06, h: 1.65, fill: { color: f.color } });
  s3.addText(f.title, { x: x + 0.25, y: y + 0.1, w: 3.8, h: 0.4, fontSize: 16, color: C.navy, bold: true, margin: 0 });
  s3.addText(f.desc, { x: x + 0.25, y: y + 0.55, w: 3.8, h: 1.0, fontSize: 11, color: C.text, lineSpacing: 20 });
});

// ═════════════════════════════════════════════
// Slide 4: Architecture
// ═════════════════════════════════════════════
let s4 = pres.addSlide();
s4.background = { color: C.cream };
addFooter(s4, 4);
s4.addText("技术架构", { x: 0.7, y: 0.3, w: 8, h: 0.6, fontSize: 30, fontFace: "Georgia", color: C.navy, bold: true, margin: 0 });
s4.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 0.95, w: 0.8, h: 0.04, fill: { color: C.amber } });

// Architecture layers
const layers = [
  { label: "浏览器", desc: "HTML/CSS/JS  ·  SSE 流式  ·  5 套主题  ·  模板卡片", color: C.navy, top: 1.2, h: 0.7 },
  { label: "FastAPI 路由层", desc: "/chat  /upload  /templates  /settings  /clear-memory", color: C.slate, top: 2.1, h: 0.7 },
  { label: "Agent 核心", desc: "Function Calling  ·  工具调度  ·  流式输出  ·  指数退避重试", color: C.blue, top: 3.0, h: 0.7 },
  { label: "工具模块  +  记忆系统", desc: "文档解析器  |  Jinja2 文案生成  |  Serper/Bing 检索  |  SQLite 记忆", color: C.green, top: 3.9, h: 0.7 },
  { label: "DeepSeek V4 API", desc: "OpenAI 兼容 SDK  ·  动态配置  ·  用户可切换任意大模型", color: C.amber, top: 4.8, h: 0.7 },
];

layers.forEach((l) => {
  s4.addShape(pres.shapes.RECTANGLE, { x: 1.2, y: l.top, w: 7.8, h: l.h, fill: { color: l.color } });
  s4.addText(l.label, { x: 1.4, y: l.top + 0.08, w: 3, h: 0.3, fontSize: 14, color: C.white, bold: true, margin: 0 });
  s4.addText(l.desc, { x: 1.4, y: l.top + 0.38, w: 7.2, h: 0.25, fontSize: 10, color: C.ivory, margin: 0 });
});

// Data labels on right
const techs = ["python-docx", "pdfplumber", "Jinja2", "httpx", "SQLite", "DOMPurify", "marked.js"];
techs.forEach((t, i) => {
  s4.addShape(pres.shapes.RECTANGLE, { x: 1.2 + i * 1.15, y: 5.75, w: 1.05, h: 0.3, fill: { color: C.white }, shadow: mkShadow() });
  s4.addText(t, { x: 1.2 + i * 1.15, y: 5.75, w: 1.05, h: 0.3, fontSize: 9, color: C.text, align: "center", valign: "middle" });
});

// ═════════════════════════════════════════════
// Slide 5: UI Design & Themes
// ═════════════════════════════════════════════
let s5 = pres.addSlide();
s5.background = { color: C.cream };
addFooter(s5, 5);
s5.addText("界面设计", { x: 0.7, y: 0.3, w: 8, h: 0.6, fontSize: 30, fontFace: "Georgia", color: C.navy, bold: true, margin: 0 });
s5.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 0.95, w: 0.8, h: 0.04, fill: { color: C.amber } });

// Layout description
cardBg(s5, 0.5, 1.2, 5.2, 2.0);
s5.addText("布局结构", { x: 0.7, y: 1.3, w: 4.8, h: 0.3, fontSize: 14, color: C.navy, bold: true, margin: 0 });
s5.addText([
  { text: "左侧边栏：功能切换 + 模板卡片 + 文件上传", options: { bullet: true, breakLine: true } },
  { text: "右侧主聊天区：消息流 + SSE 流式输出", options: { bullet: true, breakLine: true } },
  { text: "消息编辑：点击铅笔图标 → 修改 → 保存", options: { bullet: true, breakLine: true } },
  { text: "复制 / 下载 Markdown", options: { bullet: true, breakLine: true } },
  { text: "拖拽上传  ·  768px 响应式断点", options: { bullet: true } },
], { x: 0.7, y: 1.7, w: 4.8, h: 1.4, fontSize: 11, color: C.text, lineSpacing: 22 });

// 5 themes
const themes = [
  { name: "琥珀金", colors: ["C9953C", "1B1B1B"] },
  { name: "极致暗黑", colors: ["FFFFFF", "0D0D0D"] },
  { name: "纯白", colors: ["1A1A1A", "FAFAF8"] },
  { name: "松木绿", colors: ["7CB885", "1A1F1C"] },
  { name: "深海蓝", colors: ["7AACCC", "191D24"] },
];

s5.addText("5 套主题", { x: 6.2, y: 1.2, w: 3.3, h: 0.3, fontSize: 14, color: C.navy, bold: true, margin: 0 });
themes.forEach((t, i) => {
  const ty = 1.55 + i * 0.72;
  s5.addShape(pres.shapes.RECTANGLE, { x: 6.2, y: ty, w: 3.3, h: 0.6, fill: { color: C.white }, shadow: mkShadow() });
  s5.addShape(pres.shapes.OVAL, { x: 6.4, y: ty + 0.1, w: 0.4, h: 0.4, fill: { color: t.colors[0] } });
  s5.addShape(pres.shapes.OVAL, { x: 6.65, y: ty + 0.1, w: 0.4, h: 0.4, fill: { color: t.colors[1] } });
  s5.addText(t.name, { x: 7.2, y: ty, w: 2, h: 0.6, fontSize: 12, color: C.text, valign: "middle", margin: 0 });
});

// Interaction details
cardBg(s5, 0.5, 3.5, 9, 1.2);
s5.addText("交互亮点", { x: 0.7, y: 3.6, w: 8.6, h: 0.3, fontSize: 14, color: C.navy, bold: true, margin: 0 });
const interactions = [
  "流式打字机效果",
  "消息悬停操作按钮（编辑·复制·下载）",
  "设置面板即时生效（API配置 + 主题切换）",
  "模板卡片化选择，支持自定义 Jinja2 模板",
  "强制工具选择机制，纠错模型意图判断",
];
interactions.forEach((t, i) => {
  const cx = 0.7 + (i % 3) * 3.0;
  const cy = 3.95 + Math.floor(i / 3) * 0.35;
  s5.addText(t, { x: cx, y: cy, w: 2.8, h: 0.3, fontSize: 10, color: C.text, bullet: true });
});

// ═════════════════════════════════════════════
// Slide 6: Engineering
// ═════════════════════════════════════════════
let s6 = pres.addSlide();
s6.background = { color: C.cream };
addFooter(s6, 6);
s6.addText("工程实践", { x: 0.7, y: 0.3, w: 8, h: 0.6, fontSize: 30, fontFace: "Georgia", color: C.navy, bold: true, margin: 0 });
s6.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 0.95, w: 0.8, h: 0.04, fill: { color: C.amber } });

// 3 columns
const cols = [
  {
    title: "错误处理", items: [
      "指数退避重试（最多 3 次）",
      "区分可重试/不可重试错误（401vs503）",
      "降级策略：搜索后端自动切换",
      "6 种异常场景分类处理",
      "文档解析 30s 超时 + 页数上限",
    ]
  },
  {
    title: "安全措施", items: [
      "API Key .env + python-dotenv",
      "DOMPurify XSS 防护（白名单）",
      "PDF 炸弹防护（100 页上限）",
      "SQLite WAL 模式并发安全",
      "marked.js + sanitize 双层过滤",
    ]
  },
  {
    title: "技术亮点", items: [
      "搜索方案演进：DDG→Bing→Serper→RAG",
      "Python 3.8 兼容适配",
      "零构建步骤，python app.py 一键启动",
      "策略模式：搜索后端可插拔",
      "动态大模型切换（用户自定义 API）",
    ]
  },
];

cols.forEach((col, i) => {
  const x = 0.4 + i * 3.15;
  cardBg(s6, x, 1.2, 3.0, 3.6);
  s6.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 3.0, h: 0.04, fill: { color: C.amber } });
  s6.addText(col.title, { x: x + 0.15, y: 1.35, w: 2.7, h: 0.35, fontSize: 14, color: C.navy, bold: true, margin: 0 });
  col.items.forEach((item, j) => {
    s6.addText(item, { x: x + 0.15, y: 1.85 + j * 0.48, w: 2.7, h: 0.4, fontSize: 10, color: C.text, bullet: true, lineSpacing: 14 });
  });
});

// ═════════════════════════════════════════════
// Slide 7: Evolution & Roadmap
// ═════════════════════════════════════════════
let s7 = pres.addSlide();
s7.background = { color: C.cream };
addFooter(s7, 7);
s7.addText("演进路径", { x: 0.7, y: 0.3, w: 8, h: 0.6, fontSize: 30, fontFace: "Georgia", color: C.navy, bold: true, margin: 0 });
s7.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 0.95, w: 0.8, h: 0.04, fill: { color: C.amber } });

// Timeline
const phases = [
  { phase: "P0", title: "骨架搭建", desc: "FastAPI · SSE 流式 · 基础 Chat UI\nDeepSeek API 对接 · 一键启动", status: "✅ 完成" },
  { phase: "P1", title: "工具实现", desc: "文档解析器 · 文案生成器\nFunction Calling · 联网检索集成", status: "✅ 完成" },
  { phase: "P2", title: "体验增强", desc: "SQLite 记忆 · 摘要压缩\n异常处理 · 前端完整 UI", status: "✅ 完成" },
  { phase: "P3", title: "视觉打磨", desc: "5 套主题 · 模板编辑器\n消息编辑 · 响应式适配", status: "✅ 完成" },
];

phases.forEach((p, i) => {
  const x = 0.4 + i * 2.4;
  cardBg(s7, x, 1.2, 2.2, 2.2);
  s7.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 2.2, h: 0.04, fill: { color: C.amber } });
  s7.addText(p.phase, { x: x + 0.15, y: 1.35, w: 1.0, h: 0.35, fontSize: 18, color: C.amber, bold: true, fontFace: "Georgia", margin: 0 });
  s7.addText(p.title, { x: x + 0.15, y: 1.75, w: 1.9, h: 0.3, fontSize: 14, color: C.navy, bold: true, margin: 0 });
  s7.addText(p.desc, { x: x + 0.15, y: 2.1, w: 1.9, h: 0.8, fontSize: 10, color: C.text, lineSpacing: 16 });
  s7.addText(p.status, { x: x + 0.15, y: 2.95, w: 1.9, h: 0.3, fontSize: 11, color: C.green, bold: true, margin: 0 });
});

// Future
s7.addText("未来规划", { x: 0.7, y: 3.6, w: 8, h: 0.3, fontSize: 14, color: C.navy, bold: true, margin: 0 });
const future = [
  "企业级功能：组织管理 + 权限控制 + 审计日志",
  "移动端深度优化（当前移动端占比 38%）",
  "AI 模型定制化调优（文档总结 + 文案生成）",
  "国际化框架搭建（中英文切换）",
];
future.forEach((f, i) => {
  s7.addText(f, { x: 0.7 + (i % 2) * 4.5, y: 4.0 + Math.floor(i / 2) * 0.4, w: 4.3, h: 0.35, fontSize: 11, color: C.text, bullet: true });
});

// ═════════════════════════════════════════════
// Slide 8: Summary
// ═════════════════════════════════════════════
let s8 = pres.addSlide();
s8.background = { color: C.navy };
s8.addText("总结", { x: 1, y: 1.0, w: 8, h: 0.8, fontSize: 36, fontFace: "Georgia", color: C.white, bold: true });
s8.addShape(pres.shapes.RECTANGLE, { x: 1, y: 1.85, w: 1.2, h: 0.04, fill: { color: C.amber } });

s8.addText([
  { text: "从零到交付，27 次提交，16 个源文件", options: { breakLine: true, fontSize: 16, color: C.ivory } },
  { text: "", options: { breakLine: true, fontSize: 8 } },
  { text: "三大核心工具 + 智能记忆 + 5 套主题 + 动态模型", options: { breakLine: true, fontSize: 14, color: C.muted } },
  { text: "", options: { breakLine: true, fontSize: 8 } },
  { text: "技术栈：FastAPI + DeepSeek V4 + SQLite + Vanilla JS", options: { breakLine: true, fontSize: 14, color: C.muted } },
  { text: "", options: { breakLine: true, fontSize: 8 } },
  { text: "工程亮点：搜索方案 4 次演进、Function Calling 踩坑、", options: { breakLine: true, fontSize: 14, color: C.muted } },
  { text: "Python 3.8 兼容、零构建步骤一键启动", options: { fontSize: 14, color: C.muted } },
], { x: 1, y: 2.2, w: 8, h: 2.5 });

s8.addText("python app.py", { x: 2.5, y: 4.5, w: 5, h: 0.6, fontSize: 24, color: C.amber, fontFace: "Consolas", bold: true, align: "center" });

// ── Write ───────────────────────────────────
pres.writeFile({ fileName: "g:/Heracles/TF/docs/OfficeAI_项目汇报.pptx" }).then(() => {
  console.log("PPT generated: docs/OfficeAI_项目汇报.pptx");
});
