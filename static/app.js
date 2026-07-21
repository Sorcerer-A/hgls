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

// ── Markdown 渲染（marked.js + DOMPurify 防 XSS）──
function renderMarkdown(text) {
  if (typeof marked !== 'undefined') {
    const raw = marked.parse(text);
    return typeof DOMPurify !== 'undefined'
      ? DOMPurify.sanitize(raw, {
          ALLOWED_TAGS: ['p','br','strong','em','h1','h2','h3','h4','ul','ol','li','a','code','pre','table','thead','tbody','tr','th','td','blockquote','hr','img'],
          ALLOWED_ATTR: ['href','src','alt','class']
        })
      : raw;
  }
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
}

// ── 消息渲染（每条 AI 消息自动带复制和下载按钮）──
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
    if (currentTool === 'doc_generate') loadTemplates();
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
  } catch (e) { console.error('加载模板失败:', e); }
}

// ── 文件上传（按钮 + 拖拽）──
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileUpload);

const dropZone = document.getElementById('chat-container');
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) uploadFile(file);
});

function handleFileUpload() {
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
  } catch (e) { fileStatus.textContent = '上传失败，请重试'; }
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
      body: JSON.stringify({ message: text, session_id: SESSION_ID, force_tool: currentTool }),
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
          if (parsed.content) {
            // 过滤 DeepSeek 可能混入的工具调用 XML
            let clean = parsed.content;
            if (clean.includes('<') && (clean.includes('invoke') || clean.includes('tool_call'))) {
              clean = clean.replace(/<\s*\/?\s*(invoke|parameter|tool_calls)[^>]*>/gi, '');
            }
            if (clean.trim()) {
              fullText += clean;
              assistantDiv.innerHTML = renderMarkdown(fullText);
            }
          }
        } catch (e) { /* skip */ }
      }
    }
  } catch (e) {
    if (fullText) {
      setStatus('⚠️ 连接中断，部分内容可能不完整');
      assistantDiv.innerHTML = renderMarkdown(fullText + '\n\n*（连接中断，请重试）*');
    } else {
      assistantDiv.innerHTML = '<span class="error">网络连接失败，请检查网络后重试。</span>';
    }
  }
}

// ── SSE 重连逻辑 ──
let reconnectDelay = 1000;
const MAX_RECONNECT_DELAY = 30000;

async function sendMessageWithRetry(retryCount) {
  try {
    await sendMessage();
    reconnectDelay = 1000;
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
  } catch (e) { /* ignore */ }
  const newId = crypto.randomUUID();
  localStorage.setItem('officeai_session', newId);
  location.reload();
});

// ── 快捷键 ──
sendBtn.addEventListener('click', () => sendMessageWithRetry(0));
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessageWithRetry(0); }
});

// ── 欢迎消息 ──
addMessage('assistant', '你好！我是 OfficeAI 助手。\n\n- 📄 上传文档，我来帮你总结\n- 📝 选择模板，生成周报/纪要/通知\n- 🔍 需要实时信息，我帮你搜索\n\n请选择功能或直接输入需求。');
