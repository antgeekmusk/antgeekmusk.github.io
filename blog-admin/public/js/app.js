/* ============ 路由与页面注册 ============ */

const routes = {};

/** 注册一个页面：{ title, renderActions(el), render(container) } */
function registerRoute(name, def) {
    routes[name] = def;
}

function navigate() {
    const hash = location.hash.replace(/^#\/?/, '');
    const name = hash.split('?')[0] || 'articles';
    const def = routes[name] || routes.articles;

    document.querySelectorAll('.nav a').forEach((a) => a.classList.toggle('active', a.dataset.nav === name));
    document.getElementById('page-title').textContent = def.title;

    const actionsEl = document.getElementById('topbar-actions');
    actionsEl.innerHTML = '';
    if (def.renderActions) def.renderActions(actionsEl);

    def.render(document.getElementById('content'));
}

/**
 * 原地重新渲染当前路由页面（不整页刷新），并尽量保持内容区滚动位置。
 * 供「保存 / 删除 / 新增」等操作后刷新列表使用，避免滚动条回到顶部。
 */
async function refreshCurrentRoute() {
    const hash = location.hash.replace(/^#\/?/, '');
    const name = hash.split('?')[0] || 'articles';
    const def = routes[name] || routes.articles;
    const container = document.getElementById('content');
    const scrollTop = container.scrollTop;
    try {
        await def.render(container);
    } finally {
        // 渲染期间容器内容被替换，等布局完成后恢复原滚动位置
        requestAnimationFrame(() => { container.scrollTop = scrollTop; });
    }
}

window.addEventListener('hashchange', navigate);
window.addEventListener('DOMContentLoaded', () => {
    // 侧边栏展示数据目录
    api('/health').then((h) => {
        document.getElementById('side-info').textContent = '数据目录: ' + h.dataDir;
    }).catch(() => {});
    navigate();
});
