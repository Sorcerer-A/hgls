const SESSION_ID = localStorage.getItem('officeai_session') || crypto.randomUUID();
localStorage.setItem('officeai_session', SESSION_ID);
let currentTool = null;
let currentTemplate = null;  // selected template key
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
const tplInfo = document.getElementById('tpl-info');
const tplCards = document.getElementById('template-cards');
const settingsBtn = document.getElementById('settings-btn');
const settingsOverlay = document.getElementById('settings-overlay');
const settingsSave = document.getElementById('settings-save');
const settingsClose = document.getElementById('settings-close');
const themePicker = document.getElementById('theme-picker');

// ── Markdown ──
function renderMarkdown(text) {
  if (typeof marked !== 'undefined') {
    const raw = marked.parse(text);
    return typeof DOMPurify !== 'undefined'
      ? DOMPurify.sanitize(raw, { ALLOWED_TAGS: ['p','br','strong','em','h1','h2','h3','h4','ul','ol','li','a','code','pre','table','thead','tbody','tr','th','td','blockquote','hr','img'], ALLOWED_ATTR: ['href','src','alt','class'] })
      : raw;
  }
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
}

// ── Messages ──
function addMessage(role, text) {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.innerHTML = renderMarkdown(text);
  wrapper.appendChild(div);
  if (role === 'assistant' && text) {
    const btnGroup = document.createElement('div');
    btnGroup.className = 'msg-btns';
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn'; copyBtn.textContent = '📋'; copyBtn.title = '复制';
    copyBtn.onclick = () => { navigator.clipboard.writeText(text).then(() => { copyBtn.textContent = '✅'; setTimeout(() => copyBtn.textContent = '📋', 2000); }).catch(() => { copyBtn.textContent = '❌'; }); };
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'copy-btn'; downloadBtn.textContent = '⬇️'; downloadBtn.title = '下载 .md';
    downloadBtn.onclick = () => { const blob = new Blob([text], { type: 'text/markdown' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `officeai-${new Date().toISOString().slice(0,10)}.md`; a.click(); URL.revokeObjectURL(url); };
    btnGroup.appendChild(copyBtn); btnGroup.appendChild(downloadBtn);
    wrapper.appendChild(btnGroup);
  }
  messagesEl.appendChild(wrapper);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

function setStatus(text) { statusBar.textContent = text; statusBar.style.display = text ? 'block' : 'none'; }

// ── Settings ────────────────────────────────

settingsBtn.addEventListener('click', () => { loadSettings(); settingsOverlay.classList.add('show'); });
settingsClose.addEventListener('click', () => settingsOverlay.classList.remove('show'));
settingsOverlay.addEventListener('click', (e) => { if (e.target === settingsOverlay) settingsOverlay.classList.remove('show'); });

let _savedSettings = {};  // 用于比较变更

async function loadSettings() {
  try {
    const resp = await fetch('/settings');
    const s = await resp.json();
    _savedSettings = { ...s };
    document.getElementById('cfg-base').value = s.api_base || '';
    document.getElementById('cfg-key').value = s.api_key || '';
    document.getElementById('cfg-model').value = s.model || '';
    document.querySelectorAll('.theme-dot').forEach(d => d.classList.toggle('active', d.dataset.theme === (s.theme || 'amber')));
  } catch (e) { /* ignore */ }
}

settingsSave.addEventListener('click', async () => {
  const theme = document.querySelector('.theme-dot.active')?.dataset?.theme || 'amber';
  const settings = {
    api_base: document.getElementById('cfg-base').value.trim(),
    api_key: document.getElementById('cfg-key').value.trim(),
    model: document.getElementById('cfg-model').value.trim(),
    theme: theme,
  };
  try {
    await fetch('/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
    applyTheme(theme);
    settingsOverlay.classList.remove('show');
    // 只在 API 配置实际变更时提示
    const apiChanged = (settings.api_key && settings.api_key !== _savedSettings.api_key)
      || (settings.api_base && settings.api_base !== _savedSettings.api_base)
      || (settings.model && settings.model !== _savedSettings.model);
    if (apiChanged) {
      setStatus('✅ API 配置已更新，下次对话生效');
      setTimeout(() => setStatus(''), 3000);
    }
    _savedSettings = { ...settings };
  } catch (e) { alert('保存失败'); }
});

themePicker.addEventListener('click', (e) => {
  const dot = e.target.closest('.theme-dot');
  if (!dot) return;
  document.querySelectorAll('.theme-dot').forEach(d => d.classList.remove('active'));
  dot.classList.add('active');
});

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('officeai_theme', theme);
}

// Init theme
(async () => {
  try {
    const resp = await fetch('/settings');
    const s = await resp.json();
    applyTheme(s.theme || 'amber');
  } catch (e) { applyTheme(localStorage.getItem('officeai_theme') || 'amber'); }
})();

// ── Template Cards ──────────────────────────

async function loadTemplateCards() {
  try {
    const resp = await fetch('/templates');
    const templates = await resp.json();
    tplCards.innerHTML = '';
    for (const [key, t] of Object.entries(templates)) {
      const card = document.createElement('div');
      card.className = 'tpl-card' + (currentTemplate === key ? ' selected' : '');
      card.dataset.tpl = key;
      card.innerHTML = `<div class="tpl-name">${t.name}</div><div class="tpl-desc">${t.description}</div><div class="tpl-fields">必填：${t.fields.join('、')}</div>`;
      card.addEventListener('click', () => {
        document.querySelectorAll('.tpl-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        currentTemplate = key;
        tplInfo.innerHTML = `📝 已选：<strong>${t.name}</strong> — 必填：${t.fields.join('、')}<span class="tpl-clear" onclick="clearTemplate()">✕ 取消</span>`;
        tplInfo.classList.add('show');
        inputEl.placeholder = `输入${t.name}内容... 如：本周完成了XX，下周计划XX...`;
        inputEl.focus();
      });
      tplCards.appendChild(card);
    }
    if (currentTool === 'doc_generate') tplCards.classList.add('show');
  } catch (e) { console.error('加载模板失败:', e); }
}

function clearTemplate() {
  currentTemplate = null;
  tplInfo.classList.remove('show');
  document.querySelectorAll('.tpl-card').forEach(c => c.classList.remove('selected'));
  inputEl.placeholder = '输入消息... (Enter 发送, Shift+Enter 换行)';
}

// ── Tool Switching ──────────────────────────

toolBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    toolBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTool = btn.dataset.tool || null;
    currentTemplate = null;
    tplCards.classList.remove('show');
    tplInfo.classList.remove('show');
    inputEl.placeholder = '输入消息... (Enter 发送, Shift+Enter 换行)';

    if (currentTool === 'doc_summary') {
      if (uploadedFilename) {
        setStatus('📄 文档总结模式 — 已上传: ' + uploadedFilename);
        addMessage('assistant', '**📄 文档总结模式**\n\n已上传文件：**' + uploadedFilename + '**\n\n直接输入你的问题即可，如"请总结这份文档"。');
      } else {
        setStatus('📄 文档总结模式 — 请先上传文件');
        addMessage('assistant', '**📄 文档总结模式**\n\n请先在左侧上传需要总结的文档（支持 .txt / .docx / .md / .pdf）。');
      }
    } else if (currentTool === 'doc_generate') {
      setStatus('📝 文案生成模式 — 点击模板卡片选择');
      loadTemplateCards();
      tplCards.classList.add('show');
      addMessage('assistant', '**📝 文案生成模式**\n\n请点击左侧模板卡片选择类型，然后输入关键信息。');
    } else if (currentTool === 'web_search') {
      setStatus('🔍 联网检索模式');
      addMessage('assistant', '**🔍 联网检索模式**\n\n直接输入你想搜索的内容，我会实时检索并整合回答。');
    } else {
      setStatus('');
      addMessage('assistant', '**💬 自由对话模式**\n\n可直接对话，或切换左侧功能使用文档总结、文案生成、联网检索。');
    }
  });
});

// ── File Upload ─────────────────────────────

uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileUpload);

const dropZone = document.getElementById('chat-container');
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault(); dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) uploadFile(file);
});

function handleFileUpload() { const file = fileInput.files[0]; if (file) uploadFile(file); }

async function uploadFile(file) {
  if (file.size > 5 * 1024 * 1024) { fileStatus.textContent = '文件过大（上限 5MB）'; return; }
  fileStatus.textContent = `上传中: ${file.name}...`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('session_id', SESSION_ID);
  try {
    const resp = await fetch('/upload', { method: 'POST', body: formData });
    const data = await resp.json();
    if (data.error) { fileStatus.textContent = data.error; }
    else {
      uploadedFilename = data.filename;
      fileStatus.textContent = `✅ ${data.filename}（${data.full_length} 字）`;
      addMessage('assistant', `已收到文件 **${data.filename}**（${data.full_length} 字符）。\n\n预览：\n> ${data.preview}...`);
    }
  } catch (e) { fileStatus.textContent = '上传失败，请重试'; }
}

// ── Send Message ────────────────────────────

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;
  inputEl.value = '';
  addMessage('user', text);

  // 如果选了模板，自动拼接模板标识
  let finalMessage = text;
  let tool = currentTool;
  if (currentTemplate && text) {
    finalMessage = `template_key: ${currentTemplate}\n${text}`;
    tool = 'doc_generate';
  }

  const assistantDiv = addMessage('assistant', '');
  let fullText = '';

  try {
    const resp = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: finalMessage, session_id: SESSION_ID, force_tool: tool }),
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
    if (fullText) { setStatus('⚠️ 连接中断'); assistantDiv.innerHTML = renderMarkdown(fullText + '\n\n*（连接中断，请重试）*'); }
    else { assistantDiv.innerHTML = '<span class="error">网络连接失败，请检查网络后重试。</span>'; }
  }
}

// ── New Chat ────────────────────────────────

newChatBtn.addEventListener('click', async () => {
  try { await fetch('/clear-memory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: SESSION_ID }) }); } catch (e) {}
  const newId = crypto.randomUUID();
  localStorage.setItem('officeai_session', newId);
  location.reload();
});

// ── Input ───────────────────────────────────

sendBtn.addEventListener('click', sendMessage);
inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });

// ── Welcome ─────────────────────────────────

addMessage('assistant', '你好！我是 OfficeAI 助手。\n\n- 📄 上传文档，我来帮你总结\n- 📝 点击「文案生成」选择模板生成周报/纪要/通知\n- 🔍 点击「联网检索」搜索实时信息\n\n⚙️ 点击左上角齿轮图标配置 API 和主题。');
