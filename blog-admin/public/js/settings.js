/* ============ 站点设置：个人介绍 / 数据目录 / 备份 ============ */

registerRoute('settings', {
    title: '站点设置',
    async render(container) {
        container.innerHTML = '<div class="loading">加载中…</div>';
        let info;
        try {
            info = await api('/settings');
        } catch (e) {
            container.innerHTML = `<div class="empty">加载失败：${esc(e.message)}</div>`;
            return;
        }

        container.innerHTML = `
            <div class="panel">
                <h2>📝 我的介绍（"关于我" / "作品集" 页顶部展示）</h2>
                <div class="field"><span>成就页 myInfo.md</span>
                    <textarea class="input editor-area editor-area-sm" id="set-ach">${esc(info.achievementMyInfo)}</textarea>
                </div>
                <div class="field"><span>作品集页 myInfo.md</span>
                    <textarea class="input editor-area editor-area-sm" id="set-port">${esc(info.portfolioMyInfo)}</textarea>
                </div>
                <div class="field-actions">
                    <button class="btn btn-primary" id="set-save">保存介绍</button>
                </div>
            </div>

            <div class="panel">
                <h2>💾 数据与备份</h2>
                <p class="muted">站点数据目录：<code>${esc(info.dataDir)}</code></p>
                <p class="muted">后台写入的数据都在上面的目录中，也就是仓库的 <code>public/data/</code>，提交代码即可发布到线上站点。</p>
                <div class="field-actions">
                    <a class="btn" href="/data/blog/blogs_config.json" download>下载 文章配置</a>
                    <a class="btn" href="/data/blog/columns_config.json" download>下载 专栏配置</a>
                    <a class="btn" href="/data/blog/tag_color_config.json" download>下载 Tag 颜色</a>
                    <a class="btn" href="/data/achievement/achievement.json" download>下载 成就数据</a>
                    <a class="btn" href="/data/portfolio/portfolio.json" download>下载 作品集数据</a>
                </div>
            </div>

            <div class="panel">
                <h2>🔧 服务信息</h2>
                <p class="muted">线上站点：<a href="${SITE_BASE}" target="_blank" rel="noopener">${SITE_BASE}</a></p>
                <p class="muted">后台使用说明：见仓库 README 的「博客后台管理」章节。</p>
            </div>`;

        container.querySelector('#set-save').onclick = async () => {
            try {
                await api('/achievements/myinfo', { method: 'PUT', body: { content: container.querySelector('#set-ach').value } });
                await api('/portfolio/myinfo', { method: 'PUT', body: { content: container.querySelector('#set-port').value } });
                toast('介绍已保存');
            } catch (e) { toast(e.message, 'error'); }
        };
    },
});
