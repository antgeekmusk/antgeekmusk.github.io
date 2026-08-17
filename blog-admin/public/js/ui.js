/* ============ 通用 UI：转义 / Toast / 弹窗 / 标签输入 / Markdown 预览 ============ */

/** HTML 转义 */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

/** 顶部提示条 */
function toast(message, type = 'success', ms = 2600) {
    const wrap = document.getElementById('toast-wrap');
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = message;
    wrap.appendChild(el);
    setTimeout(() => el.classList.add('toast-out'), ms);
    setTimeout(() => el.remove(), ms + 320);
}

/** 打开弹窗，返回 { box, close } */
function openModal(html, { width = '800px' } = {}) {
    const mask = document.getElementById('modal-mask');
    const box = document.getElementById('modal-box');
    box.innerHTML = html;
    box.style.maxWidth = width;
    mask.classList.add('open');
    document.body.classList.add('no-scroll');
    const close = () => {
        mask.classList.remove('open');
        document.body.classList.remove('no-scroll');
    };
    mask.onclick = (e) => { if (e.target === mask) close(); };
    box.querySelectorAll('[data-close]').forEach((btn) => btn.addEventListener('click', close));
    return { box, close };
}

/** 确认对话框，返回 Promise<boolean> */
function confirmDialog(message, { title = '确认操作', danger = false } = {}) {
    return new Promise((resolve) => {
        const mask = document.getElementById('modal-mask');
        const box = document.getElementById('modal-box');
        box.innerHTML = `
            <div class="modal-head">${esc(title)}</div>
            <div class="modal-body confirm-body">${esc(message)}</div>
            <div class="modal-foot">
                <button class="btn" data-close>取消</button>
                <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="confirm-ok">确定</button>
            </div>`;
        box.style.maxWidth = '440px';
        mask.classList.add('open');
        document.body.classList.add('no-scroll');
        const done = (v) => {
            mask.classList.remove('open');
            document.body.classList.remove('no-scroll');
            resolve(v);
        };
        mask.onclick = (e) => { if (e.target === mask) done(false); };
        box.querySelectorAll('[data-close]').forEach((btn) => btn.addEventListener('click', () => done(false)));
        box.querySelector('#confirm-ok').onclick = () => done(true);
    });
}

/**
 * 标签/专栏输入框：输入后回车或逗号确认，生成胶囊。
 * 返回值可通过 container.dataset.value（JSON 数组）读取。
 */
function chipsInput({ value = [], suggestions = [], placeholder = '输入后回车确认', onChange = () => {} } = {}) {
    const container = document.createElement('div');
    container.className = 'chips';
    const chips = new Set(value);
    container.dataset.value = JSON.stringify([...chips]);

    const input = document.createElement('input');
    input.className = 'chips-input';
    input.placeholder = placeholder;

    const dlId = 'dl-' + Math.random().toString(36).slice(2, 9);
    const datalist = document.createElement('datalist');
    datalist.id = dlId;
    suggestions.forEach((s) => {
        const o = document.createElement('option');
        o.value = s;
        datalist.appendChild(o);
    });
    document.body.appendChild(datalist);
    input.setAttribute('list', dlId);

    const commit = () => {
        container.dataset.value = JSON.stringify([...chips]);
        onChange([...chips]);
    };

    const render = () => {
        container.querySelectorAll('.chip').forEach((c) => c.remove());
        chips.forEach((c) => {
            const chip = document.createElement('span');
            chip.className = 'chip';
            chip.innerHTML = `${esc(c)}<span class="chip-x" title="移除">×</span>`;
            chip.querySelector('.chip-x').onclick = () => { chips.delete(c); render(); commit(); };
            container.insertBefore(chip, input);
        });
    };

    const add = () => {
        const v = input.value.trim();
        if (v) { chips.add(v); input.value = ''; render(); commit(); }
    };

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
        else if (e.key === 'Backspace' && !input.value && chips.size) {
            const last = [...chips].pop();
            chips.delete(last);
            render();
            commit();
        }
    });
    input.addEventListener('blur', () => { if (input.value.trim()) add(); });
    container.appendChild(input);
    render();
    return container;
}

/** 在 textarea 光标处插入文本 */
function insertAtCursor(textarea, text) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const sep = start !== end ? '\n' : '';
    textarea.value = textarea.value.slice(0, start) + sep + text + '\n' + textarea.value.slice(end);
    textarea.selectionStart = textarea.selectionEnd = start + sep.length + text.length + 1;
    textarea.focus();
}

/* ---------------- 轻量 Markdown 预览 ---------------- */

function renderMarkdown(md, baseUrl = '') {
    if (!md || !String(md).trim()) return '<div class="empty">（无内容）</div>';
    const lines = String(md).replace(/\r\n/g, '\n').split('\n');

    /** 行内样式：图片 / 链接 / 行内代码 / 加粗 / 斜体 / 删除线 */
    const inline = (s) => {
        s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (m, alt, src) => {
            const url = /^https?:/.test(src) ? src : (src.startsWith('/') ? src : (baseUrl ? baseUrl + '/' + src : src));
            return `<img src="${esc(url)}" alt="${esc(alt)}" loading="lazy">`;
        });
        s = s.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (m, t, u) => `<a href="${esc(u)}" target="_blank" rel="noopener">${t}</a>`);
        s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
        s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
        s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
        return s;
    };

    const renderTable = (rows) => {
        const cells = (row) => row.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
        const html = rows.map((r, idx) => {
            if (idx === 1 && /^[\s|:-]+$/.test(r)) return ''; // 分隔行
            const tag = idx === 0 ? 'th' : 'td';
            return `<tr>${cells(r).map((c) => `<${tag}>${inline(esc(c))}</${tag}>`).join('')}</tr>`;
        }).join('');
        return `<table><tbody>${html}</tbody></table>`;
    };

    const out = [];
    let i = 0;
    let inCode = false;
    let codeBuf = [];
    let listType = null; // 'ul' | 'ol'
    let inTable = false;
    let tableBuf = [];
    let para = [];

    const flushPara = () => { if (para.length) { out.push(`<p>${para.join(' ')}</p>`); para = []; } };
    const flushList = () => { if (listType === 'ul') out.push('</ul>'); if (listType === 'ol') out.push('</ol>'); listType = null; };
    const flushTable = () => { if (inTable) { out.push(renderTable(tableBuf)); tableBuf = []; inTable = false; } };

    while (i < lines.length) {
        const line = lines[i];

        // 代码块
        const fence = line.match(/^```(\S*)/);
        if (fence) {
            flushPara(); flushList(); flushTable();
            if (inCode) {
                out.push(`<pre><code>${esc(codeBuf.join('\n'))}</code></pre>`);
                codeBuf = [];
                inCode = false;
            } else {
                inCode = true;
            }
            i++; continue;
        }
        if (inCode) { codeBuf.push(line); i++; continue; }

        const trimmed = line.trim();

        // 表格（以 | 开头，或上一行已经是表格）
        if (inTable || /^\s*\|/.test(line)) {
            flushPara(); flushList();
            if (/^\s*\|/.test(trimmed)) { inTable = true; tableBuf.push(line); i++; continue; }
            flushTable();
        }

        if (trimmed === '') { flushPara(); flushList(); flushTable(); i++; continue; }

        // 标题
        const h = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (h) {
            flushPara(); flushList(); flushTable();
            const level = h[1].length;
            out.push(`<h${level}>${inline(esc(h[2]))}</h${level}>`);
            i++; continue;
        }
        // 分割线
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
            flushPara(); flushList(); flushTable();
            out.push('<hr>');
            i++; continue;
        }
        // 引用
        if (trimmed.startsWith('>')) {
            flushPara(); flushList(); flushTable();
            out.push(`<blockquote>${inline(esc(trimmed.replace(/^>\s?/, '')))}</blockquote>`);
            i++; continue;
        }
        // 无序列表
        const ul = trimmed.match(/^[-*+]\s+(.*)$/);
        if (ul) {
            flushPara(); flushTable();
            if (listType !== 'ul') { flushList(); out.push('<ul>'); listType = 'ul'; }
            out.push(`<li>${inline(esc(ul[1]))}</li>`);
            i++; continue;
        }
        // 有序列表
        const ol = trimmed.match(/^\d+[.、)]\s+(.*)$/);
        if (ol) {
            flushPara(); flushTable();
            if (listType !== 'ol') { flushList(); out.push('<ol>'); listType = 'ol'; }
            out.push(`<li>${inline(esc(ol[1]))}</li>`);
            i++; continue;
        }
        flushList();
        para.push(inline(esc(trimmed)));
        i++;
    }

    if (inCode) out.push(`<pre><code>${esc(codeBuf.join('\n'))}</code></pre>`);
    flushPara();
    flushList();
    flushTable();
    return out.join('\n');
}
