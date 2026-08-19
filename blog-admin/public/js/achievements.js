/* ============ 足迹管理 ============ */

registerRoute('achievements', {
    title: '足迹管理',
    renderActions(el) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.textContent = '+ 新增年份';
        btn.onclick = async () => {
            const year = prompt('请输入 4 位年份，例如 2025');
            if (!year || !/^\d{4}$/.test(year)) return;
            try {
                await api('/achievements', {
                    method: 'POST',
                    body: { year, title: '占位足迹，请编辑', date: `${year}-01-01`, description: '', emoji: '⭐', tags: [] },
                });
                toast('年份已创建');
                location.reload();
            } catch (e) { toast(e.message, 'error'); }
        };
        el.appendChild(btn);
    },
    async render(container) {
        container.innerHTML = '<div class="loading">加载中…</div>';
        let data;
        try {
            data = await api('/achievements');
        } catch (e) {
            container.innerHTML = `<div class="empty">加载失败：${esc(e.message)}</div>`;
            return;
        }
        const years = data.years || [];
        if (!years.length) {
            container.innerHTML = '<div class="empty">暂无足迹数据，点击右上角「新增年份」开始吧</div>';
            return;
        }

        container.innerHTML = years.map((year) => `
            <div class="panel year-panel">
                <div class="year-head">
                    <h2>${esc(year.year)} <span class="muted">(${(year.items || []).length} 条)</span></h2>
                    <button class="btn btn-sm" data-add-year="${esc(year.year)}">+ 添加足迹</button>
                </div>
                <div class="year-items">
                    ${(year.items || []).map((item, idx) => `
                        <div class="achi-card">
                            <div class="achi-emoji">${esc(item.emoji || '⭐')}</div>
                            <div class="achi-main">
                                <div class="achi-title">${esc(item.title)}</div>
                                <div class="achi-meta">${esc(item.date)} · ${(item.tags || []).join(' / ') || '无标签'}</div>
                                ${item.description ? `<div class="achi-desc">${esc(String(item.description).slice(0, 140))}${String(item.description).length > 140 ? '…' : ''}</div>` : ''}
                                ${(item.images || []).length ? `<div class="achi-imgs">${item.images.map((im) => `<img src="${esc(im)}" alt="">`).join('')}</div>` : ''}
                            </div>
                            <div class="achi-actions">
                                <button class="btn btn-sm" data-edit="${idx}" data-year="${esc(year.year)}">编辑</button>
                                <button class="btn btn-sm btn-danger" data-del="${idx}" data-year="${esc(year.year)}">删除</button>
                            </div>
                        </div>`).join('') || '<div class="empty">该年份暂无足迹</div>'}
                </div>
            </div>`).join('');

        container.querySelectorAll('[data-add-year]').forEach((btn) => {
            btn.onclick = () => openAchievementEditor({ year: btn.dataset.addYear, item: null });
        });
        container.querySelectorAll('[data-edit]').forEach((btn) => {
            btn.onclick = () => {
                const year = years.find((y) => y.year === btn.dataset.year);
                if (year && year.items[Number(btn.dataset.edit)]) {
                    openAchievementEditor({ year: btn.dataset.year, item: year.items[Number(btn.dataset.edit)], index: Number(btn.dataset.edit) });
                }
            };
        });
        container.querySelectorAll('[data-del]').forEach((btn) => {
            btn.onclick = async () => {
                const ok = await confirmDialog('确定删除这条足迹吗？', { title: '删除足迹', danger: true });
                if (!ok) return;
                try {
                    await api(`/achievements/${btn.dataset.year}/${btn.dataset.del}`, { method: 'DELETE' });
                    toast('已删除');
                    location.reload();
                } catch (e) { toast(e.message, 'error'); }
            };
        });
    },
});

/** 足迹编辑器（新建 / 编辑共用） */
async function openAchievementEditor({ year, item, index }) {
    const isNew = !item;
    const base = item || { title: '', emoji: '⭐', description: '', date: `${year}-01-01`, tags: [], images: [] };
    let tagSuggest = [];
    try { tagSuggest = (await api('/tags')).map((t) => t.name); } catch (e) { /* ignore */ }

    const { box } = openModal(`
        <div class="modal-head">${isNew ? `新增足迹（${esc(year)}）` : '编辑足迹'}</div>
        <div class="modal-body form-grid">
            <div class="field"><span>标题 *</span><input class="input" id="ac-title" value="${esc(base.title)}"></div>
            <div class="field"><span>Emoji</span><input class="input" id="ac-emoji" value="${esc(base.emoji || '')}"></div>
            <div class="field"><span>日期</span><input class="input" id="ac-date" type="date" value="${esc(base.date)}"></div>
            <div class="field"><span>Tag</span><div id="ac-tags"></div></div>
            <div class="field field-full"><span>描述（支持 Markdown）</span><textarea class="input" id="ac-desc" rows="4">${esc(base.description)}</textarea></div>
            <div class="field field-full"><span>图片</span>
                <div class="img-list" id="ac-images"></div>
                <button class="btn btn-sm" id="ac-upload">+ 上传图片</button>
                <input type="file" id="ac-file" accept="image/*" multiple hidden>
            </div>
        </div>
        <div class="modal-foot">
            <button class="btn" data-close>取消</button>
            <button class="btn btn-primary" id="ac-save">保存</button>
        </div>
    `, { width: '720px' });

    let images = [...(base.images || [])];
    const imgList = box.querySelector('#ac-images');
    const renderImages = () => {
        imgList.innerHTML = images.length
            ? images.map((im, idx) => `
                <div class="img-item">
                    <img src="${esc(im)}" alt="">
                    <button class="img-remove" data-idx="${idx}">×</button>
                </div>`).join('')
            : '<span class="muted">暂无图片</span>';
        imgList.querySelectorAll('.img-remove').forEach((b) => {
            b.onclick = () => { images.splice(Number(b.dataset.idx), 1); renderImages(); };
        });
    };
    renderImages();

    const chipsTags = chipsInput({ value: base.tags, suggestions: tagSuggest, placeholder: '输入后回车' });
    box.querySelector('#ac-tags').appendChild(chipsTags);

    const fileInput = box.querySelector('#ac-file');
    box.querySelector('#ac-upload').onclick = () => fileInput.click();
    fileInput.onchange = async () => {
        const files = [...fileInput.files];
        if (!files.length) return;
        try {
            const saved = await uploadImages('/achievements/images', files);
            images.push(...saved.map((f) => f.url));
            renderImages();
            toast(`已上传 ${saved.length} 张图片`);
        } catch (e) { toast('上传失败: ' + e.message, 'error'); }
        fileInput.value = '';
    };

    box.querySelector('#ac-save').onclick = async () => {
        const payload = {
            year,
            title: box.querySelector('#ac-title').value.trim(),
            emoji: box.querySelector('#ac-emoji').value.trim(),
            date: box.querySelector('#ac-date').value,
            description: box.querySelector('#ac-desc').value,
            tags: JSON.parse(chipsTags.dataset.value || '[]'),
            images,
        };
        if (!payload.title) { toast('请填写标题', 'warning'); return; }
        try {
            if (isNew) await api('/achievements', { method: 'POST', body: payload });
            else await api(`/achievements/${year}/${index}`, { method: 'PUT', body: payload });
            toast('已保存');
            location.reload();
        } catch (e) { toast(e.message, 'error'); }
    };
}
