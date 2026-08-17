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

window.addEventListener('hashchange', navigate);
window.addEventListener('DOMContentLoaded', () => {
    // 侧边栏展示数据目录
    api('/health').then((h) => {
        document.getElementById('side-info').textContent = '数据目录: ' + h.dataDir;
    }).catch(() => {});
    navigate();
});
