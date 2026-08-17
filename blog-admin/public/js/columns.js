/* ============ 专栏管理 ============ */

registerRoute('columns', {
    title: '专栏管理',
    renderActions(el) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.textContent = '+ 新增专栏';
        btn.onclick = () => openColumnEditor(null);
        el.appendChild(btn);
    },
    async render(container) {
        container.innerHTML = '<div class="loading">加载中…</div>';
        let list;
        try {
            list = await api('/columns');
        } catch (e) {
            container.innerHTML = `<div class="empty">加载失败：${esc(e.message)}</div>`;
            return;
        }
        if (!list.length) {
            container.innerHTML = '<div class="empty">暂无专栏</div>';
            return;
        }

        container.innerHTML = `
            <div class="panel">
                <div class="table-wrap">
                    <table class="table">
                        <thead><tr><th>名称</th><th>排序 order（越大越靠前）</th><th>文章数</th><th style="width:170px">操作</th></tr></thead>
                        <tbody>
                            ${list.map((c) => `<tr>
                                <td>${esc(c.name)}</td>
                                <td><input class="input input-sm" type="number" data-order="${esc(c.name)}" value="${c.order}" style="width:80px"></td>
                                <td>${c.articleCount}</td>
                                <td class="cell-actions">
                                    <button class="btn btn-sm" data-rename="${esc(c.name)}">重命名</button>
                                    <button class="btn btn-sm btn-danger" data-del="${esc(c.name)}">删除</button>
                                </td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="panel-foot muted">💡 删除专栏会同步从引用它的文章中移除该专栏；重命名会同步更新引用它的文章。</div>
            </div>`;

        container.querySelectorAll('[data-order]').forEach((input) => {
            input.addEventListener('change', async () => {
                const prev = input.value;
                try {
                    await api(`/columns/${encodeURIComponent(input.dataset.order)}`, { method: 'PUT', body: { order: Number(input.value) || 1 } });
                    toast('排序已更新');
                } catch (e) { toast(e.message, 'error'); input.value = prev; }
            });
        });
        container.querySelectorAll('[data-rename]').forEach((btn) => {
            btn.onclick = () => openColumnEditor({ name: btn.dataset.rename });
        });
        container.querySelectorAll('[data-del]').forEach((btn) => {
            btn.onclick = async () => {
                const ok = await confirmDialog(`确定删除专栏「${btn.dataset.del}」吗？\n引用该专栏的文章会同步移除这个专栏。`, { title: '删除专栏', danger: true });
                if (!ok) return;
                try {
                    const r = await api(`/columns/${encodeURIComponent(btn.dataset.del)}`, { method: 'DELETE' });
                    toast(`已删除${(r.affectedArticles || []).length ? `，并从 ${r.affectedArticles.length} 篇文章中移除` : ''}`);
                    location.reload();
                } catch (e) { toast(e.message, 'error'); }
            };
        });
    },
});

/** 专栏编辑器（新增 / 重命名共用） */
function openColumnEditor(column) {
    const isNew = !column;
    const { box } = openModal(`
        <div class="modal-head">${isNew ? '新增专栏' : `重命名专栏「${esc(column.name)}」`}</div>
        <div class="modal-body form-grid">
            <div class="field"><span>专栏名称 *</span><input class="input" id="col-name" value="${esc(column ? column.name : '')}"></div>
            <div class="field"><span>排序 order</span><input class="input" id="col-order" type="number" value="${column ? column.order : 1}"></div>
        </div>
        <div class="modal-foot">
            <button class="btn" data-close>取消</button>
            <button class="btn btn-primary" id="col-save">保存</button>
        </div>
    `, { width: '460px' });

    box.querySelector('#col-save').onclick = async () => {
        const name = box.querySelector('#col-name').value.trim();
        if (!name) { toast('请填写专栏名称', 'warning'); return; }
        const body = { name, order: Number(box.querySelector('#col-order').value) || 1 };
        try {
            if (isNew) await api('/columns', { method: 'POST', body });
            else await api(`/columns/${encodeURIComponent(column.name)}`, { method: 'PUT', body });
            toast('已保存');
            location.reload();
        } catch (e) { toast(e.message, 'error'); }
    };
}
