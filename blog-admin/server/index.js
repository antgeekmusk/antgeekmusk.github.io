/**
 * 博客后台管理系统 - 服务入口。
 *
 * 启动：npm start（或 node server/index.js）
 * 环境变量：
 *   PORT         监听端口，默认 3000
 *   BLOG_DATA_DIR 站点数据目录，默认 仓库根/public/data
 */
const express = require('express');
const { DATA_DIR, SITE_PUBLIC_DIR, ADMIN_PUBLIC_DIR } = require('./config');

const app = express();
app.use(express.json({ limit: '20mb' }));

// 根路径 → 后台管理页面
app.get('/', (req, res) => res.redirect('/admin/'));

// 站点数据（public 目录）：文章图片 /data/... 与线上路径一致，后台可直接预览
app.use(express.static(SITE_PUBLIC_DIR, { index: false }));

// 后台管理界面
app.use('/admin', express.static(ADMIN_PUBLIC_DIR));

// ---- API ----
app.use('/api/health', (req, res) => {
    res.json({ ok: true, dataDir: DATA_DIR, time: new Date().toISOString() });
});
app.use('/api/articles', require('./routes/articles'));
app.use('/api/columns', require('./routes/columns'));
app.use('/api/tags', require('./routes/tags'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/settings', require('./routes/settings'));

// API 404
app.use('/api', (req, res) => res.status(404).json({ error: '接口不存在' }));

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    console.log('==============================================');
    console.log('  博客后台管理系统已启动');
    console.log(`  后台管理地址 : http://localhost:${PORT}/admin/`);
    console.log(`  站点数据目录 : ${DATA_DIR}`);
    console.log('==============================================');
});
