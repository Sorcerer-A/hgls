const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "OfficeAI Dev";
pres.title = "OfficeAI 项目汇报";

const C = {
  navy: "1B1B2F", slate: "2D2D44", amber: "C9953C", ivory: "DAD5CC",
  cream: "F5F4F0", white: "FFFFFF", text: "1A1A2E", muted: "8A857C",
  green: "5B9A6B", teal: "0D9488", blue: "5B7FA5", red: "D4735A",
  gray: "E8E8E4",
};

const sh = () => ({ type: "outer", blur: 3, offset: 1.5, angle: 135, color: "000000", opacity: 0.08 });
const amber = (s, x, y) => s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.6, h: 0.03, fill: { color: C.amber } });
const title = (s, txt) => { s.addText(txt, { x: 0.5, y: 0.25, w: 9, h: 0.55, fontSize: 26, fontFace: "Georgia", color: C.navy, bold: true, margin: 0 }); amber(s, 0.5, 0.8); };
const footer = (s, num) => { s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.37, w: 10, h: 0.255, fill: { color: C.navy } }); s.addText("OfficeAI · " + num, { x: 9.0, y: 5.37, w: 0.7, h: 0.255, fontSize: 8, color: C.muted, valign: "middle", align: "center" }); };
const card = (s, x, y, w, h) => s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.white }, shadow: sh() });
const img = (s, x, y, w, h, label) => { s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.gray }, line: { color: "BBBBBB", width: 1, dashType: "dash" } }); s.addText("[ 截图：" + label + " ]", { x, y, w, h, fontSize: 12, color: C.muted, align: "center", valign: "middle" }); };
const bullet = (s, x, y, w, h, lines) => { const arr = lines.map((l, i) => ({ text: l, options: { bullet: true, breakLine: i < lines.length - 1 } })); s.addText(arr, { x, y, w, h, fontSize: 13, color: C.text, lineSpacing: 28, valign: "top" }); };

// ═══ 1: Cover ═══
let pg = pres.addSlide(); pg.background = { color: C.navy };
pg.addText("轻量企业办公 AI 助手", { x: 1, y: 1.3, w: 8, h: 1.2, fontSize: 42, fontFace: "Georgia", color: C.white, bold: true });
amber(pg, 1, 2.6);
pg.addText("项目开发汇报", { x: 1, y: 2.8, w: 8, h: 0.6, fontSize: 24, color: C.ivory });
pg.addText("35 次提交 · 16 个源文件 · 5 套主题 · 零构建部署\nFastAPI + DeepSeek V4 + SQLite + 原生 HTML/CSS/JS", { x: 1, y: 3.7, w: 8, h: 0.8, fontSize: 14, color: C.muted, lineSpacing: 26 });

// ═══ 2: UI Overview ═══
pg = pres.addSlide(); pg.background = { color: C.cream }; footer(pg, 2);
title(pg, "界面设计");
img(pg, 0.5, 1.1, 6.5, 3.0, "主界面 — 左右分栏聊天窗口");

// Right: themes + interaction
card(pg, 7.3, 1.1, 2.4, 3.0);
pg.addText("5 套主题", { x: 7.45, y: 1.2, w: 2.1, h: 0.35, fontSize: 13, color: C.navy, bold: true, margin: 0 });
const themes = [{ n: "琥珀金", c: "C9953C" }, { n: "暗黑", c: "FFFFFF" }, { n: "纯白", c: "1A1A1A" }, { n: "松木绿", c: "7CB885" }, { n: "深海蓝", c: "7AACCC" }];
themes.forEach((t, i) => {
  const ty = 1.65 + i * 0.5;
  pg.addShape(pres.shapes.OVAL, { x: 7.45, y: ty + 0.05, w: 0.28, h: 0.28, fill: { color: t.c } });
  pg.addText(t.n, { x: 7.85, y: ty, w: 1.5, h: 0.38, fontSize: 12, color: C.text, valign: "middle", margin: 0 });
});
pg.addShape(pres.shapes.RECTANGLE, { x: 7.3, y: 4.1, w: 0, h: 0, fill: { color: C.white } }); // spacer

pg.addText("交互亮点", { x: 0.5, y: 4.3, w: 3, h: 0.35, fontSize: 14, color: C.navy, bold: true, margin: 0 });
card(pg, 0.5, 4.7, 9.1, 0.55);
pg.addText("流式打字机 · 弹跳圆点等待动效 + 进度条 · 消息编辑复制下载 (SVG 图标) · 拖拽上传 · 768px 响应式 · 工具切换防刷屏", { x: 0.7, y: 4.7, w: 8.7, h: 0.55, fontSize: 12, color: C.text, valign: "middle" });

// ═══ 3: Doc Summary ═══
pg = pres.addSlide(); pg.background = { color: C.cream }; footer(pg, 3);
title(pg, "文档总结");
img(pg, 0.5, 1.1, 5.8, 2.8, "上传文档 → 提问 → AI 总结");

// Right: feature list
card(pg, 6.5, 1.1, 3.1, 2.8);
pg.addText("支持格式", { x: 6.65, y: 1.2, w: 2.8, h: 0.3, fontSize: 13, color: C.navy, bold: true, margin: 0 });
bullet(pg, 6.65, 1.6, 2.8, 2.1, [
  ".txt  UTF-8/GBK 自动检测",
  ".docx  python-docx",
  ".md   直接读取",
  ".pdf  pdfplumber",
  "安全限制: 5MB, 100页, 30s",
]);

// Bottom: 2 tech cards
card(pg, 0.5, 4.1, 4.3, 1.1);
pg.addText("文件上下文注入", { x: 0.65, y: 4.15, w: 4, h: 0.28, fontSize: 12, color: C.navy, bold: true, margin: 0 });
pg.addText("上传 → SQLite sessions.file_text\n关键词检测自动注入到用户消息\n重启不丢失，内存缓存加速", { x: 0.65, y: 4.45, w: 4, h: 0.7, fontSize: 12, color: C.text, lineSpacing: 24 });

card(pg, 5.0, 4.1, 4.6, 1.1);
pg.addText("解析管线", { x: 5.15, y: 4.15, w: 4.3, h: 0.28, fontSize: 12, color: C.navy, bold: true, margin: 0 });
pg.addText("asyncio.wait_for 30s 超时 · ParseError 分类\n_truncate_if_needed 30000字截断\n编码回退: UTF-8 → GBK → GB2312", { x: 5.15, y: 4.45, w: 4.3, h: 0.7, fontSize: 12, color: C.text, lineSpacing: 24 });

// ═══ 4: Doc Generator ═══
pg = pres.addSlide(); pg.background = { color: C.cream }; footer(pg, 4);
title(pg, "文案生成");
img(pg, 0.5, 1.1, 5.5, 2.6, "模板卡片选择 + 输入 + 生成结果");

// Templates
card(pg, 6.2, 1.1, 3.4, 2.6);
pg.addText("三套模板", { x: 6.35, y: 1.2, w: 3, h: 0.3, fontSize: 13, color: C.navy, bold: true, margin: 0 });
bullet(pg, 6.35, 1.6, 3.1, 1.9, [
  "📊 周报: 本周完成 + 下周计划 + 问题风险",
  "📋 会议纪要: 议题 + 决议 + 待办 + 责任人",
  "📢 工作通知: 通知对象 + 事项 + 时间 + 要求",
  "模板卡片点击即选，输入框自动提示必填字段",
  "用户可在设置中自定义 Jinja2 模板",
]);

// Bottom
card(pg, 0.5, 3.9, 4.3, 1.3);
pg.addText("生成流程", { x: 0.65, y: 3.95, w: 4, h: 0.28, fontSize: 12, color: C.navy, bold: true, margin: 0 });
pg.addText("选择卡片 → 输入内容 → 前端拼接\ntemplate_key:weekly_report\\n[内容]\n后端解析 → Jinja2 渲染 → DeepSeek 流式输出", { x: 0.65, y: 4.25, w: 4, h: 0.9, fontSize: 12, color: C.text, lineSpacing: 24 });

card(pg, 5.0, 3.9, 4.6, 1.3);
pg.addText("模板引擎", { x: 5.15, y: 3.95, w: 4.3, h: 0.28, fontSize: 12, color: C.navy, bold: true, margin: 0 });
pg.addText("Jinja2: 默认 .j2 + 自定义 (SQLite)\n加载优先级: 自定义 > 默认\n语法: {{ fields.get('字段','默认') }}\n清空文本框即可恢复默认模板", { x: 5.15, y: 4.25, w: 4.3, h: 0.9, fontSize: 12, color: C.text, lineSpacing: 24 });

// ═══ 5: Web Search ═══
pg = pres.addSlide(); pg.background = { color: C.cream }; footer(pg, 5);
title(pg, "联网检索");
img(pg, 0.5, 1.1, 5.5, 2.4, "搜索结果 + AI 整合回答");

// RAG flow
card(pg, 6.2, 1.1, 3.4, 2.4);
pg.addText("RAG 检索增强生成", { x: 6.35, y: 1.2, w: 3, h: 0.3, fontSize: 13, color: C.navy, bold: true, margin: 0 });
bullet(pg, 6.35, 1.6, 3.1, 1.8, [
  "用户提问 → 追加当前日期",
  "Serper API Google 搜索",
  "tbs=qdr:w 近一周过滤",
  "搜索结果注入 Prompt",
  "DeepSeek 整合流式输出",
]);

// Bottom
card(pg, 0.5, 3.7, 4.3, 1.5);
pg.addText("搜索方案演进", { x: 0.65, y: 3.75, w: 4, h: 0.28, fontSize: 12, color: C.navy, bold: true, margin: 0 });
bullet(pg, 0.65, 4.1, 4, 1.0, [
  "V1 DuckDuckGo → 国内屏蔽",
  "V2 Bing HTML → 中文差 · 乱码",
  "V3 Serper API → Google 质量 · 缓存 · 故障切换",
  "当前: RAG 直接注入 → 无 XML 泄露",
]);

card(pg, 5.0, 3.7, 4.6, 1.5);
pg.addText("技术实现", { x: 5.15, y: 3.75, w: 4.3, h: 0.28, fontSize: 12, color: C.navy, bold: true, margin: 0 });
bullet(pg, 5.15, 4.1, 4.3, 1.0, [
  "策略模式: SearchBackend 抽象基类",
  "SearchManager: 缓存 TTL 1h + LRU 100",
  "冷却 3s · 连续失败 3 次切换后端",
  "不走 Function Calling → 单次 API 调用",
]);

// ═══ 6: Architecture ═══
pg = pres.addSlide(); pg.background = { color: C.cream }; footer(pg, 6);
title(pg, "技术架构");
const arch = [
  { l: "浏览器", d: "HTML/CSS/JS + SSE 流式 · 5 套主题 · 模板卡片 · 拖拽上传 · DOMPurify XSS", c: C.navy, y: 1.1 },
  { l: "FastAPI 路由", d: "/chat (SSE) · /upload · /templates · /settings · /clear-memory", c: C.slate, y: 1.72 },
  { l: "Agent 核心", d: "工具调度 · 流式输出 · 指数退避重试 · 用户动态 API 配置 · 文件上下文注入", c: C.blue, y: 2.30 },
  { l: "工具模块", d: "doc_parser (txt/docx/md/pdf) | doc_generator (Jinja2) | web_search (策略模式)", c: C.teal, y: 2.88 },
  { l: "记忆系统", d: "SQLite (WAL + asyncio.Lock) · 滑动窗口 · 异步摘要压缩 · 7 天清理 · 用户设置", c: C.green, y: 3.46 },
  { l: "DeepSeek V4 API", d: "OpenAI 兼容 SDK · 动态 api_key/api_base/model · 配置 SQLite → .env 回退", c: C.amber, y: 4.04 },
];
arch.forEach((a) => {
  pg.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: a.y, w: 9.1, h: 0.52, fill: { color: a.c } });
  pg.addText(a.l, { x: 0.7, y: a.y + 0.04, w: 4, h: 0.2, fontSize: 13, color: C.white, bold: true, margin: 0 });
  pg.addText(a.d, { x: 0.7, y: a.y + 0.27, w: 8.7, h: 0.2, fontSize: 10, color: C.ivory, margin: 0 });
});
// Tech stack
const techs = ["python-docx", "pdfplumber", "Jinja2", "httpx", "Serper", "SQLite", "DOMPurify", "marked.js"];
techs.forEach((t, i) => pg.addShape(pres.shapes.RECTANGLE, { x: 0.5 + i * 1.15, y: 4.7, w: 1.05, h: 0.32, fill: { color: C.white }, shadow: sh() }));
techs.forEach((t, i) => pg.addText(t, { x: 0.5 + i * 1.15, y: 4.7, w: 1.05, h: 0.32, fontSize: 10, color: C.text, align: "center", valign: "middle" }));
pg.addText("搜索方案 4 次演进  ·  Python 3.8 兼容  ·  零构建  ·  策略模式  ·  35 次原子提交  ·  3 轮设计审查", { x: 0.5, y: 5.05, w: 9.1, h: 0.25, fontSize: 11, color: C.muted, align: "center" });

// ═══ 7: Settings & Memory ═══
pg = pres.addSlide(); pg.background = { color: C.cream }; footer(pg, 7);
title(pg, "设置面板 & 上下文记忆");

card(pg, 0.5, 1.1, 4.3, 2.7);
pg.addText("设置面板", { x: 0.65, y: 1.2, w: 4, h: 0.3, fontSize: 14, color: C.navy, bold: true, margin: 0 });
bullet(pg, 0.7, 1.6, 3.9, 2.0, [
  "API 配置: Base URL + Key + Model",
  "支持任意兼容 OpenAI SDK 的大模型",
  "修改即时生效 · 空值回退 .env",
  "5 套主题一键切换 (CSS 变量)",
  "模板编辑器: 点击展开 · 预填默认",
  "修改保存到 SQLite · 清空恢复默认",
]);

card(pg, 5.0, 1.1, 4.6, 2.7);
pg.addText("上下文记忆", { x: 5.15, y: 1.2, w: 4.3, h: 0.3, fontSize: 14, color: C.navy, bold: true, margin: 0 });
bullet(pg, 5.2, 1.6, 4.2, 2.0, [
  "滑动窗口: 保留最近 10 轮完整对话",
  "摘要压缩: 超过 10 轮异步后台压缩",
  "最早 5 轮 → 1-2 句摘要",
  "asyncio.create_task 不阻塞请求",
  "SQLite WAL 模式 + asyncio.Lock",
  "7 天自动清理 · 重启不丢失",
]);

img(pg, 0.5, 4.0, 9.1, 1.25, "设置面板 — API 配置 + 主题切换 + 模板编辑器");

// ═══ 8: Summary ═══
pg = pres.addSlide(); pg.background = { color: C.navy };
pg.addText("项目总结", { x: 0.8, y: 0.4, w: 8, h: 0.7, fontSize: 34, fontFace: "Georgia", color: C.white, bold: true }); amber(pg, 0.8, 1.1);

const stats = [{ v: "35", l: "次提交" }, { v: "16", l: "源文件" }, { v: "5", l: "套主题" }, { v: "3", l: "大工具" }];
stats.forEach((st, i) => {
  const sx = 0.8 + i * 2.25;
  pg.addText(st.v, { x: sx, y: 1.4, w: 1.8, h: 0.7, fontSize: 42, color: C.amber, bold: true, fontFace: "Georgia", align: "center" });
  pg.addText(st.l, { x: sx, y: 2.1, w: 1.8, h: 0.3, fontSize: 13, color: C.muted, align: "center" });
});

const cols = [
  { t: "功能交付", i: ["文档总结: 4格式+安全+SQLite", "文案生成: 3模板+卡片+自定义", "联网检索: Serper+RAG+过滤", "上下文记忆: 窗口+压缩+WAL", "设置面板: API+主题+模板"] },
  { t: "UI / UX", i: ["5套主题系统 (CSS变量)", "等待动效: 圆点+进度条+状态", "消息编辑·复制·下载 (SVG)", "模板卡片化·拖拽上传·响应式", "工具切换防刷屏·清除聊天"] },
  { t: "工程质量", i: ["搜索方案4次演进+XML修复", "Python3.8+Windows兼容", "DOMPurify XSS·SQLite并发", "35次提交·3轮设计审查", "零构建: python app.py"] },
];
cols.forEach((col, i) => {
  const sx = 0.3 + i * 3.25;
  pg.addShape(pres.shapes.RECTANGLE, { x: sx, y: 2.7, w: 0.06, h: 2.0, fill: { color: C.amber } });
  pg.addText(col.t, { x: sx + 0.2, y: 2.7, w: 2.8, h: 0.35, fontSize: 14, color: C.ivory, bold: true, margin: 0 });
  col.i.forEach((item, j) => pg.addText(item, { x: sx + 0.2, y: 3.1 + j * 0.32, w: 2.9, h: 0.28, fontSize: 11, color: C.muted, bullet: true }));
});

pg.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.0, w: 10, h: 0.625, fill: { color: "141428" } });
pg.addText("python app.py  —  一键启动  ·  零构建  ·  http://localhost:8000", { x: 1, y: 5.0, w: 8, h: 0.625, fontSize: 18, color: C.amber, valign: "middle", align: "center" });

const out = "g:/Heracles/TF/docs/OfficeAI_项目汇报_v6.pptx";
pres.writeFile({ fileName: out }).then(() => console.log("Done: " + out));
