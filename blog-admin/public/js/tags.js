/* ============ Tag 管理 ============ */

registerRoute('tags', {
    title: 'Tag 管理',
    renderActions(el) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.textContent = '+ 手动添加 Tag 颜色';
        btn.onclick = async () => {
            const name = prompt('输入 Tag 名称');
            if (!name || !name.trim()) return;
            try {
                await api(`/tags/${encodeURIComponent(name.trim())}`, { method: 'PUT', body: { color: 'blue' } });
                toast('已添加（默认蓝色，可在列表中修改）');
                location.reload();
            } catch (e) { toast(e.message, 'error'); }
        };
        el.appendChild(btn);
    },
    async render(container) {
        container.innerHTML = '<div class="loading">加载中…</div>';
        let list;
        try {
            list = await api('/tags');
        } catch (e) {
            container.innerHTML = `<div class="empty">加载失败：${esc(e.message)}</div>`;
            return;
        }
        if (!list.length) {
            container.innerHTML = '<div class="empty">暂无 Tag，去文章 / 成就 / 作品集里添加吧</div>';
            return;
        }

        container.innerHTML = `
            <div class="panel">
                <div class="panel-tools">
                    <input class="input input-search" id="tag-search" placeholder="搜索 Tag…">
                    <span class="muted">共 ${list.length} 个 Tag（来源：文章 / 成就 / 作品集）</span>
                </div>
                <div class="table-wrap">
                    <table class="table">
                        <thead><tr><th>Tag</th><th>使用次数</th><th>颜色</th><th style="width:200px">操作</th></tr></thead>
                        <tbody id="tag-tbody">
                            ${list.map((t) => `<tr>
                                <td><span class="chip chip-static chip-tag" style="--chip-color:${esc(t.color)}">${esc(t.name)}</span></td>
                                <td>${t.usage}</td>
                                <td>
                                    <select class="input input-sm" data-color="${esc(t.name)}">
                                        <option value="">（默认）</option>
                                        ${TAG_COLORS.map((c) => `<option value="${c}" ${t.color === c ? 'selected' : ''}>${c}</option>`).join('')}
                                    </select>
                                </td>
                                <td class="cell-actions">
                                    <button class="btn btn-sm" data-save-color="${esc(t.name)}">应用</button>
                                    ${t.color ? `<button class="btn btn-sm btn-danger" data-clear-color="${esc(t.name)}">清除颜色</button>` : ''}
                                </td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="panel-foot muted">💡 颜色仅支持 antd 预设色；Tag 列表由文章 / 成就 / 作品集中的标签自动汇总。</div>
            </div>`;

        container.querySelector('#tag-search').addEventListener('input', (e) => {
            const kw = e.target.value.trim().toLowerCase();
            container.querySelectorAll('#tag-tbody tr').forEach((tr) => {
                tr.style.display = tr.textContent.toLowerCase().includes(kw) ? '' : 'none';
            });
        });

        container.querySelectorAll('[data-save-color]').forEach((btn) => {
            btn.onclick = async () => {
                const sel = container.querySelector(`[data-color="${CSS.escape(btn.dataset.saveColor)}"]`);
                if (!sel) return;
                const color = sel.value;
                try {
                    await api(`/tags/${encodeURIComponent(btn.dataset.saveColor)}`, { method: 'PUT', body: { color } });
                    toast(color ? `已设置颜色 ${color}` : '已恢复默认色');
                    location.reload();
                } catch (e) { toast(e.message, 'error'); }
            };
        });
        container.querySelectorAll('[data-clear-color]').forEach((btn) => {
            btn.onclick = async () => {
                try {
                    await api(`/tags/${encodeURIComponent(btn.dataset.clearColor)}`, { method: 'DELETE' });
                    toast('已清除颜色配置');
                    location.reload();
                } catch (e) { toast(e.message, 'error'); }
            };
        });
    },
});
