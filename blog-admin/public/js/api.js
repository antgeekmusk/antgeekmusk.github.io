/* ============ 与后端交互的统一封装 ============ */

/** 线上站点地址（后台里的"查看"链接用） */
const SITE_BASE = 'https://antgeekmusk.github.io';

/** antd Tag 预设颜色 */
const TAG_COLORS = ['magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple'];

/**
 * 调用 REST API。
 * @param {string} path  如 '/articles'、'/articles/12'
 * @param {object} options  fetch 选项；body 为对象时自动 JSON 序列化
 */
async function api(path, options = {}) {
    const opts = { headers: {}, ...options };
    if (opts.body && typeof opts.body !== 'string') {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(opts.body);
    }
    const resp = await fetch('/api' + path, opts);
    let data = null;
    try { data = await resp.json(); } catch (e) { /* 忽略非 JSON 响应 */ }
    if (!resp.ok) {
        throw new Error((data && data.error) ? data.error : `请求失败 (HTTP ${resp.status})`);
    }
    return data;
}

/** 上传多张图片（multipart/form-data），返回 [{name, url}] */
async function uploadImages(url, files) {
    const fd = new FormData();
    for (const f of files) fd.append('files', f);
    const resp = await fetch('/api' + url, { method: 'POST', body: fd });
    let data = null;
    try { data = await resp.json(); } catch (e) { /* ignore */ }
    if (!resp.ok) throw new Error((data && data.error) || '上传失败');
    return (data && data.files) || [];
}
