/* ============ 文章管理 ============ */

function parseBlogPath(p) {
    const parts = String(p || '').split('/').filter(Boolean);
    return { date: parts[0] || '', id: parts[1] || '' };
}

registerRoute('articles', {
    title: '文章管理',
    renderActions(el) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.textContent = '+ 新建文章';
        btn.onclick = () => openArticleEditor(null);
        el.appendChild(btn);
    },
    async render(container) {
        container.innerHTML = '<div class="loading">加载中…</div>';
        let list;
        try {
            list = await api('/articles');
        } catch (e) {
            container.innerHTML = `<div class="empty">加载失败：${esc(e.message)}</div>`;
            return;
        }
        if (!list.length) {
            container.innerHTML = '<div class="empty">暂无文章，点击右上角「新建文章」开始吧</div>';
            return;
        }

        const rows = list.map((b) => {
            const { date, id } = parseBlogPath(b.path);
            return `<tr>
                <td>${b.id}</td>
                <td class="cell-title">${esc(b.title)}${b.contentExists ? '' : ' <span class="badge badge-warn">缺正文</span>'}</td>
                <td>${esc(b.date)}</td>
                <td>${(b.columns || []).map((c) => `<span class="chip chip-static">${esc(c)}</span>`).join('') || '—'}</td>
                <td>${(b.tags || []).map((t) => `<span class="chip chip-static chip-tag">${esc(t)}</span>`).join('') || '—'}</td>
                <td class="cell-actions">
                    <button class="btn btn-sm" data-act="edit" data-id="${b.id}">编辑</button>
                    <a class="btn btn-sm btn-link" href="${SITE_BASE}/blog/${date}/${id}" target="_blank" rel="noopener">查看</a>
                    <button class="btn btn-sm btn-danger" data-act="del" data-id="${b.id}">删除</button>
                </td>
            </tr>`;
        }).join('');

        container.innerHTML = `
            <div class="panel">
                <div class="panel-tools">
                    <input class="input input-search" id="article-search" placeholder="搜索标题 / 专栏 / 标签…">
                    <span class="muted">共 ${list.length} 篇</span>
                </div>
                <div class="table-wrap">
                    <table class="table">
                        <thead><tr><th>ID</th><th>标题</th><th>日期</th><th>专栏</th><th>Tag</th><th style="width:190px">操作</th></tr></thead>
                        <tbody id="article-tbody">${rows}</tbody>
                    </table>
                </div>
            </div>`;

        container.querySelector('#article-search').addEventListener('input', (e) => {
            const kw = e.target.value.trim().toLowerCase();
            container.querySelectorAll('#article-tbody tr').forEach((tr) => {
                tr.style.display = tr.textContent.toLowerCase().includes(kw) ? '' : 'none';
            });
        });

        container.querySelectorAll('#article-tbody [data-act]').forEach((btn) => {
            btn.onclick = async () => {
                const blog = list.find((b) => String(b.id) === String(btn.dataset.id));
                if (!blog) return;
                if (btn.dataset.act === 'edit') {
                    openArticleEditor(blog);
                } else if (btn.dataset.act === 'del') {
                    const ok = await confirmDialog(
                        `确定删除文章「${blog.title}」吗？\n该文章的内容文件夹（Markdown 正文、图片等）会一并删除，且不可恢复。`,
                        { title: '删除文章', danger: true }
                    );
                    if (!ok) return;
                    try {
                        await api(`/articles/${blog.id}`, { method: 'DELETE' });
                        toast('文章已删除');
                        location.reload();
                    } catch (e) { toast(e.message, 'error'); }
                }
            };
        });
    },
});

/** 文章编辑器（新建 / 编辑共用） */
async function openArticleEditor(blog) {
    const isNew = !blog;
    let content = '';
    if (blog) {
        try { content = (await api(`/articles/${blog.id}`)).content || ''; }
        catch (e) { toast('加载正文失败: ' + e.message, 'error'); }
    }

    let columnSuggest = [];
    let tagSuggest = [];
    try {
        columnSuggest = (await api('/columns')).map((c) => c.name);
        tagSuggest = (await api('/tags')).map((t) => t.name);
    } catch (e) { /* 建议列表加载失败不阻塞编辑 */ }

    // 文章图片预览的基准路径（正文中图片是相对文件名）
    let baseUrl = blog ? `/data/blog/content${blog.path.split('/').slice(0, 3).join('/')}` : '';
    const today = new Date().toISOString().slice(0, 10);

    const { box } = openModal(`
        <div class="modal-head">${isNew ? '新建文章' : `编辑文章 #${blog.id}`}</div>
        <div class="modal-body article-editor">
            <div class="editor-left">
                <div class="field"><span>标题 *</span><input class="input" id="art-title" value="${esc(blog ? blog.title : '')}"></div>
                <div class="field"><span>发布日期 *</span><input class="input" id="art-date" type="date" value="${esc(blog ? blog.date : today)}"></div>
                <div class="field"><span>描述（列表页摘要）</span><textarea class="input" id="art-desc" rows="3">${esc(blog ? blog.description : '')}</textarea></div>
                <div class="field"><span>专栏（可多选 / 新建）</span><div id="art-columns"></div></div>
                <div class="field"><span>Tag（可多选 / 新建）</span><div id="art-tags"></div></div>
                <div class="field"><span>列表占位文字 image_text</span><input class="input" id="art-image-text" value="${esc(blog ? blog.image_text || '' : '')}"></div>
                ${isNew ? '<div class="hint">💡 新文章保存后即可上传图片（图片保存在该文章的目录里，正文用相对文件名引用）</div>' : ''}
            </div>
            <div class="editor-right">
                <div class="editor-tabs">
                    <button class="tab active" data-tab="edit">编辑</button>
                    <button class="tab" data-tab="preview">预览</button>
                    <span class="spacer"></span>
                    <button class="btn btn-sm" id="art-upload" ${isNew ? 'disabled' : ''}>上传图片</button>
                    <input type="file" id="art-file" accept="image/*" multiple hidden>
                </div>
                <textarea class="input editor-area" id="art-content" placeholder="在这里编写 Markdown 正文…">${esc(content)}</textarea>
                <div class="editor-preview" id="art-preview" hidden></div>
            </div>
        </div>
        <div class="modal-foot">
            <span class="muted" id="art-hint">${isNew ? '保存后会按 日期/id 生成目录' : ''}</span>
            <button class="btn" data-close>取消</button>
            <button class="btn btn-primary" id="art-save">保存</button>
        </div>
    `, { width: '1080px' });

    let currentId = blog ? blog.id : null;

    const chipsColumns = chipsInput({ value: blog ? blog.columns : [], suggestions: columnSuggest, placeholder: '输入后回车' });
    const chipsTags = chipsInput({ value: blog ? blog.tags : [], suggestions: tagSuggest, placeholder: '输入后回车' });
    box.querySelector('#art-columns').appendChild(chipsColumns);
    box.querySelector('#art-tags').appendChild(chipsTags);

    const contentArea = box.querySelector('#art-content');
    const previewArea = box.querySelector('#art-preview');
    const fileInput = box.querySelector('#art-file');
    const uploadBtn = box.querySelector('#art-upload');

    // 编辑 / 预览 切换
    box.querySelectorAll('.tab').forEach((tab) => {
        tab.onclick = () => {
            box.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t === tab));
            const isPreview = tab.dataset.tab === 'preview';
            contentArea.hidden = isPreview;
            previewArea.hidden = !isPreview;
            if (isPreview) previewArea.innerHTML = renderMarkdown(contentArea.value, baseUrl);
        };
    });

    // 上传图片 → 插入 markdown 图片语法
    uploadBtn.onclick = () => fileInput.click();
    fileInput.onchange = async () => {
        if (!currentId) { toast('请先保存文章，再上传图片', 'warning'); return; }
        const files = [...fileInput.files];
        if (!files.length) return;
        try {
            const saved = await uploadImages(`/articles/${currentId}/images`, files);
            insertAtCursor(contentArea, saved.map((f) => `![${f.name}](${f.name})`).join('\n'));
            toast(`已上传 ${saved.length} 张图片`);
        } catch (e) { toast('上传失败: ' + e.message, 'error'); }
        fileInput.value = '';
    };

    // 保存
    box.querySelector('#art-save').onclick = async () => {
        const payload = {
            title: box.querySelector('#art-title').value.trim(),
            date: box.querySelector('#art-date').value,
            description: box.querySelector('#art-desc').value.trim(),
            columns: JSON.parse(chipsColumns.dataset.value || '[]'),
            tags: JSON.parse(chipsTags.dataset.value || '[]'),
            image_text: box.querySelector('#art-image-text').value.trim(),
            content: contentArea.value,
        };
        if (!payload.title) { toast('请填写标题', 'warning'); return; }
        if (!payload.date) { toast('请选择发布日期', 'warning'); return; }
        try {
            if (currentId) {
                await api(`/articles/${currentId}`, { method: 'PUT', body: payload });
                toast('已保存');
            } else {
                const created = await api('/articles', { method: 'POST', body: payload });
                currentId = created.id;
                baseUrl = `/data/blog/content${created.path.split('/').slice(0, 3).join('/')}`;
                uploadBtn.disabled = false;
                box.querySelector('.modal-head').textContent = `编辑文章 #${created.id}`;
                box.querySelector('#art-hint').textContent = '文章已创建，现在可以上传图片了';
                toast('文章已创建');
            }
        } catch (e) { toast(e.message, 'error'); }
    };
}
