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
                await refreshCurrentRoute();
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
                    await refreshCurrentRoute();
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

    // images 元素：已有图片为 URL 字符串；临时图片为 { blob, preview, name }，仅保存在内存中
    let images = [...(base.images || [])];
    const objectUrls = new Set();

    const { box, close } = openModal(`
        <div class="modal-head">${isNew ? `新增足迹（${esc(year)}）` : '编辑足迹'}</div>
        <div class="modal-body form-grid">
            <div class="field"><span>标题 *</span><input class="input" id="ac-title" value="${esc(base.title)}"></div>
            <div class="field"><span>Emoji</span><input class="input" id="ac-emoji" value="${esc(base.emoji || '')}"></div>
            <div class="field"><span>日期</span><input class="input" id="ac-date" type="date" value="${esc(base.date)}"></div>
            <div class="field"><span>Tag</span><div id="ac-tags"></div></div>
            <div class="field field-full"><span>描述（支持 Markdown）</span><textarea class="input" id="ac-desc" rows="4">${esc(base.description)}</textarea></div>
            <div class="field field-full"><span>图片</span>
                <div class="img-list" id="ac-images"></div>
                <div class="field-actions">
                    <button class="btn btn-sm" id="ac-upload" type="button">+ 添加图片</button>
                </div>
                <div class="hint">💡 支持直接粘贴剪贴板图片（Ctrl/Cmd+V）；可拖拽或用 ◀ ▶ 调整顺序。图片只在点击「保存」时才会真正写入服务器，中途删除不会残留文件；保存后按「标题_序号」命名</div>
                <input type="file" id="ac-file" accept="image/*" multiple hidden>
            </div>
        </div>
        <div class="modal-foot">
            <button class="btn" data-close>取消</button>
            <button class="btn btn-primary" id="ac-save">保存</button>
        </div>
    `, {
        width: '720px',
        // 弹窗关闭时：移除粘贴监听 + 释放临时图片的预览 URL
        onClose: () => {
            box.removeEventListener('paste', onPaste);
            objectUrls.forEach((u) => URL.revokeObjectURL(u));
            objectUrls.clear();
        },
    });

    const imgList = box.querySelector('#ac-images');
    const uploadBtn = box.querySelector('#ac-upload');
    const saveBtn = box.querySelector('#ac-save');

    const isTemp = (it) => it && typeof it === 'object';
    const srcOf = (it) => (isTemp(it) ? it.preview : it);
    const nameOf = (it) => (isTemp(it) ? (it.name || '待上传图片') : imageName(it));

    /** 已有图片的文件名 */
    const imageName = (url) => {
        let name = String(url).split('/').pop() || '';
        try { name = decodeURIComponent(name); } catch (e) { /* 保留原名 */ }
        return name;
    };

    /** 移除第 idx 张图片，并释放临时图片的内存 */
    const removeImage = (idx) => {
        const [removed] = images.splice(idx, 1);
        if (isTemp(removed)) {
            URL.revokeObjectURL(removed.preview);
            objectUrls.delete(removed.preview);
        }
        renderImages();
    };

    const renderImages = () => {
        imgList.innerHTML = images.length
            ? images.map((it, idx) => {
                const name = nameOf(it);
                return `
                    <div class="img-item ${isTemp(it) ? 'is-temp' : ''}" draggable="true" data-idx="${idx}">
                        <img src="${esc(srcOf(it))}" alt="" draggable="false">
                        ${isTemp(it) ? '<span class="img-badge">待保存</span>' : ''}
                        <div class="img-name" title="${esc(name)}">${esc(name)}</div>
                        <div class="img-tools">
                            <button class="img-move" type="button" data-move="-1" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''} title="前移">◀</button>
                            <button class="img-move" type="button" data-move="1" data-idx="${idx}" ${idx === images.length - 1 ? 'disabled' : ''} title="后移">▶</button>
                            <button class="img-remove" type="button" data-idx="${idx}" title="删除">×</button>
                        </div>
                    </div>`;
            }).join('')
            : '<span class="muted">暂无图片</span>';

        // 拖拽调整顺序
        let dragIdx = null;
        imgList.querySelectorAll('.img-item[draggable="true"]').forEach((el) => {
            el.addEventListener('dragstart', () => {
                dragIdx = Number(el.dataset.idx);
                el.classList.add('dragging');
            });
            el.addEventListener('dragend', () => {
                el.classList.remove('dragging');
                dragIdx = null;
            });
            el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('drag-over'); });
            el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
            el.addEventListener('drop', (e) => {
                e.preventDefault();
                el.classList.remove('drag-over');
                const to = Number(el.dataset.idx);
                if (dragIdx === null || dragIdx === to || dragIdx < 0 || dragIdx >= images.length) return;
                const [moved] = images.splice(dragIdx, 1);
                images.splice(to, 0, moved);
                renderImages();
            });
        });

        // 按钮调整顺序 / 删除
        imgList.querySelectorAll('.img-move').forEach((b) => {
            b.onclick = () => {
                const i = Number(b.dataset.idx);
                const to = i + Number(b.dataset.move);
                if (to < 0 || to >= images.length) return;
                [images[i], images[to]] = [images[to], images[i]];
                renderImages();
            };
        });
        imgList.querySelectorAll('.img-remove').forEach((b) => {
            b.onclick = () => removeImage(Number(b.dataset.idx));
        });
    };
    renderImages();

    const chipsTags = chipsInput({ value: base.tags, suggestions: tagSuggest, placeholder: '输入后回车' });
    box.querySelector('#ac-tags').appendChild(chipsTags);

    /** 添加图片（文件选择 / 剪贴板共用）：仅暂存内存，不写入服务器 */
    const addImages = (files) => {
        const MAX_SIZE = 20 * 1024 * 1024;
        const added = [];
        for (const f of files) {
            if (!f.type.startsWith('image/')) continue;
            if (f.size > MAX_SIZE) {
                toast(`「${f.name || '图片'}」超过 20MB，已跳过`, 'warning');
                continue;
            }
            const preview = URL.createObjectURL(f);
            objectUrls.add(preview);
            added.push({ blob: f, preview, name: f.name || '' });
        }
        if (!added.length) return;
        images.push(...added);
        renderImages();
        toast(`已添加 ${added.length} 张图片，点击「保存」后才会真正上传`);
    };

    // 剪贴板粘贴图片（截图 / 复制图片文件均可）
    const onPaste = (e) => {
        if (!e.clipboardData) return;
        const files = [];
        for (const item of e.clipboardData.items || []) {
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const f = item.getAsFile();
                if (f) files.push(f);
            }
        }
        for (const f of e.clipboardData.files || []) {
            if (f.type.startsWith('image/') && !files.includes(f)) files.push(f);
        }
        if (!files.length) return;
        e.preventDefault();
        addImages(files);
    };
    box.addEventListener('paste', onPaste);

    const fileInput = box.querySelector('#ac-file');
    uploadBtn.onclick = () => fileInput.click();
    fileInput.onchange = () => {
        addImages([...fileInput.files]);
        fileInput.value = '';
    };

    /** 组装保存请求：最终图片顺序里，临时图片用 __temp__k 占位，文件按 k 顺序放入 multipart */
    const buildSaveBody = () => {
        const fd = new FormData();
        const ordered = [];
        const tempFiles = [];
        for (const it of images) {
            if (isTemp(it)) {
                const k = tempFiles.length;
                tempFiles.push(it.blob);
                ordered.push(`__temp__${k}`);
            } else {
                ordered.push(it);
            }
        }
        fd.append('year', String(year));
        fd.append('title', box.querySelector('#ac-title').value.trim());
        fd.append('emoji', box.querySelector('#ac-emoji').value.trim());
        fd.append('date', box.querySelector('#ac-date').value);
        fd.append('description', box.querySelector('#ac-desc').value);
        fd.append('tags', chipsTags.dataset.value || '[]');
        fd.append('images', JSON.stringify(ordered));
        tempFiles.forEach((b, k) => fd.append('files', b, b.name || `pasted-${k}.png`));
        return fd;
    };

    saveBtn.onclick = async () => {
        if (!box.querySelector('#ac-title').value.trim()) { toast('请填写标题', 'warning'); return; }
        saveBtn.disabled = true;
        saveBtn.textContent = '保存中…';
        try {
            const body = buildSaveBody();
            if (isNew) await api('/achievements', { method: 'POST', body });
            else await api(`/achievements/${year}/${index}`, { method: 'PUT', body });
            toast('已保存');
            close(); // 关闭编辑弹窗
            await refreshCurrentRoute(); // 原地刷新列表，保持滚动位置
        } catch (e) {
            toast(e.message, 'error');
            saveBtn.disabled = false;
            saveBtn.textContent = '保存';
        }
    };
}
