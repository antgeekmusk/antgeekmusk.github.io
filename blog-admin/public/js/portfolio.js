/* ============ 作品集管理 ============ */

registerRoute('portfolio', {
    title: '作品集管理',
    renderActions(el) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.textContent = '+ 新增年份';
        btn.onclick = async () => {
            const year = prompt('请输入 4 位年份，例如 2025');
            if (!year || !/^\d{4}$/.test(year)) return;
            try {
                await api('/portfolio', {
                    method: 'POST',
                    body: { year, title: '占位作品，请编辑', date: `${year}-01-01`, description: '', emoji: '💼', route: '', tags: [] },
                });
                toast('年份已创建');
                await refreshCurrentRoute();
            } catch (e) { toast(e.message, 'error'); }
        };
        el.appendChild(btn);
    },
    async render(container) {
        container.innerHTML = '<div class="loading">加载中…</div>';
        let data;
        try {
            data = await api('/portfolio');
        } catch (e) {
            container.innerHTML = `<div class="empty">加载失败：${esc(e.message)}</div>`;
            return;
        }
        const years = data.years || [];
        if (!years.length) {
            container.innerHTML = '<div class="empty">暂无作品集数据，点击右上角「新增年份」开始吧</div>';
            return;
        }

        container.innerHTML = years.map((year) => `
            <div class="panel year-panel">
                <div class="year-head">
                    <h2>${esc(year.year)} <span class="muted">(${(year.items || []).length} 条)</span></h2>
                    <button class="btn btn-sm" data-add-year="${esc(year.year)}">+ 添加作品</button>
                </div>
                <div class="year-items">
                    ${(year.items || []).map((item, idx) => `
                        <div class="achi-card">
                            <div class="achi-emoji">${esc(item.emoji || '💼')}</div>
                            <div class="achi-main">
                                <div class="achi-title">${esc(item.title)}</div>
                                <div class="achi-meta">${esc(item.date)} · ${(item.tags || []).join(' / ') || '无标签'}${item.route ? ` · 路由：${esc(item.route)}` : ''}</div>
                                ${item.description ? `<div class="achi-desc">${esc(String(item.description).slice(0, 140))}${String(item.description).length > 140 ? '…' : ''}</div>` : ''}
                                ${(item.images || []).length ? `<div class="achi-imgs">${item.images.map((im) => `<img src="${esc(im)}" alt="">`).join('')}</div>` : ''}
                            </div>
                            <div class="achi-actions">
                                <button class="btn btn-sm" data-edit="${idx}" data-year="${esc(year.year)}">编辑</button>
                                <button class="btn btn-sm btn-danger" data-del="${idx}" data-year="${esc(year.year)}">删除</button>
                            </div>
                        </div>`).join('') || '<div class="empty">该年份暂无作品</div>'}
                </div>
            </div>`).join('');

        container.querySelectorAll('[data-add-year]').forEach((btn) => {
            btn.onclick = () => openPortfolioEditor({ year: btn.dataset.addYear, item: null });
        });
        container.querySelectorAll('[data-edit]').forEach((btn) => {
            btn.onclick = () => {
                const year = years.find((y) => y.year === btn.dataset.year);
                if (year && year.items[Number(btn.dataset.edit)]) {
                    openPortfolioEditor({ year: btn.dataset.year, item: year.items[Number(btn.dataset.edit)], index: Number(btn.dataset.edit) });
                }
            };
        });
        container.querySelectorAll('[data-del]').forEach((btn) => {
            btn.onclick = async () => {
                const ok = await confirmDialog('确定删除这条作品吗？', { title: '删除作品', danger: true });
                if (!ok) return;
                try {
                    await api(`/portfolio/${btn.dataset.year}/${btn.dataset.del}`, { method: 'DELETE' });
                    toast('已删除');
                    await refreshCurrentRoute();
                } catch (e) { toast(e.message, 'error'); }
            };
        });
    },
});

/** 作品编辑器（新建 / 编辑共用，含 route 路由字段） */
async function openPortfolioEditor({ year, item, index }) {
    const isNew = !item;
    const base = item || { title: '', emoji: '💼', description: '', date: `${year}-01-01`, route: '', tags: [], images: [] };
    let tagSuggest = [];
    try { tagSuggest = (await api('/tags')).map((t) => t.name); } catch (e) { /* ignore */ }

    const { box, close } = openModal(`
        <div class="modal-head">${isNew ? `新增作品（${esc(year)}）` : '编辑作品'}</div>
        <div class="modal-body form-grid">
            <div class="field"><span>标题 *</span><input class="input" id="pf-title" value="${esc(base.title)}"></div>
            <div class="field"><span>Emoji</span><input class="input" id="pf-emoji" value="${esc(base.emoji || '')}"></div>
            <div class="field"><span>日期</span><input class="input" id="pf-date" type="date" value="${esc(base.date)}"></div>
            <div class="field"><span>页面路由 route</span><input class="input" id="pf-route" placeholder="/practice/tic-tac-toe" value="${esc(base.route || '')}"></div>
            <div class="field"><span>Tag</span><div id="pf-tags"></div></div>
            <div class="field"><span>卡片点击跳转（在线站点）</span><span class="hint">填写 route 后，卡片点击会跳转到线上站点 /Portfolio + route 路径</span></div>
            <div class="field field-full"><span>描述（支持 Markdown）</span><textarea class="input" id="pf-desc" rows="4">${esc(base.description)}</textarea></div>
            <div class="field field-full"><span>图片</span>
                <div class="img-list" id="pf-images"></div>
                <button class="btn btn-sm" id="pf-upload">+ 上传图片</button>
                <input type="file" id="pf-file" accept="image/*" multiple hidden>
            </div>
        </div>
        <div class="modal-foot">
            <button class="btn" data-close>取消</button>
            <button class="btn btn-primary" id="pf-save">保存</button>
        </div>
    `, { width: '720px' });

    let images = [...(base.images || [])];
    const imgList = box.querySelector('#pf-images');
    const imageName = (url) => {
        let name = String(url).split('/').pop() || '';
        try { name = decodeURIComponent(name); } catch (e) { /* 保留原名 */ }
        return name;
    };
    const renderImages = () => {
        imgList.innerHTML = images.length
            ? images.map((im, idx) => `
                <div class="img-item">
                    <img src="${esc(im)}" alt="" draggable="false">
                    <div class="img-name" title="${esc(imageName(im))}">${esc(imageName(im))}</div>
                    <div class="img-tools">
                        <button class="img-remove" data-idx="${idx}">×</button>
                    </div>
                </div>`).join('')
            : '<span class="muted">暂无图片</span>';
        imgList.querySelectorAll('.img-remove').forEach((b) => {
            b.onclick = () => { images.splice(Number(b.dataset.idx), 1); renderImages(); };
        });
    };
    renderImages();

    const chipsTags = chipsInput({ value: base.tags, suggestions: tagSuggest, placeholder: '输入后回车' });
    box.querySelector('#pf-tags').appendChild(chipsTags);

    const fileInput = box.querySelector('#pf-file');
    box.querySelector('#pf-upload').onclick = () => fileInput.click();
    fileInput.onchange = async () => {
        const files = [...fileInput.files];
        if (!files.length) return;
        try {
            const saved = await uploadImages('/portfolio/images', files);
            images.push(...saved.map((f) => f.url));
            renderImages();
            toast(`已上传 ${saved.length} 张图片`);
        } catch (e) { toast('上传失败: ' + e.message, 'error'); }
        fileInput.value = '';
    };

    box.querySelector('#pf-save').onclick = async () => {
        const payload = {
            year,
            title: box.querySelector('#pf-title').value.trim(),
            emoji: box.querySelector('#pf-emoji').value.trim(),
            date: box.querySelector('#pf-date').value,
            route: box.querySelector('#pf-route').value.trim(),
            description: box.querySelector('#pf-desc').value,
            tags: JSON.parse(chipsTags.dataset.value || '[]'),
            images,
        };
        if (!payload.title) { toast('请填写标题', 'warning'); return; }
        try {
            if (isNew) await api('/portfolio', { method: 'POST', body: payload });
            else await api(`/portfolio/${year}/${index}`, { method: 'PUT', body: payload });
            toast('已保存');
            close(); // 关闭编辑弹窗
            await refreshCurrentRoute(); // 原地刷新列表，保持滚动位置
        } catch (e) { toast(e.message, 'error'); }
    };
}
