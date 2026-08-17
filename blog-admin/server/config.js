/**
 * 路径配置：统一管理站点数据目录的位置。
 *
 * 默认指向仓库根目录下的 public/data（与线上 GitHub Pages 的数据目录一致），
 * 可通过环境变量 BLOG_DATA_DIR 覆盖（例如指向其他位置的博客数据）。
 */
const path = require('path');
const fs = require('fs');

const MODULE_DIR = path.resolve(__dirname, '..');
const SITE_ROOT = path.resolve(MODULE_DIR, '..');

const DATA_DIR = process.env.BLOG_DATA_DIR
    ? path.resolve(process.env.BLOG_DATA_DIR)
    : path.join(SITE_ROOT, 'public', 'data');

const SITE_PUBLIC_DIR = path.join(SITE_ROOT, 'public');
const ADMIN_PUBLIC_DIR = path.join(MODULE_DIR, 'public');

const DATA_PATHS = {
    blogsConfig: path.join(DATA_DIR, 'blog', 'blogs_config.json'),
    columnsConfig: path.join(DATA_DIR, 'blog', 'columns_config.json'),
    tagColorConfig: path.join(DATA_DIR, 'blog', 'tag_color_config.json'),
    blogContent: path.join(DATA_DIR, 'blog', 'content'),
    achievementJson: path.join(DATA_DIR, 'achievement', 'achievement.json'),
    achievementMyInfo: path.join(DATA_DIR, 'achievement', 'myInfo.md'),
    achievementImages: path.join(DATA_DIR, 'achievement', 'images'),
    portfolioJson: path.join(DATA_DIR, 'portfolio', 'portfolio.json'),
    portfolioMyInfo: path.join(DATA_DIR, 'portfolio', 'myInfo.md'),
    portfolioImages: path.join(DATA_DIR, 'portfolio', 'images'),
};

/** 确保目录存在 */
function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

// 启动时确保所有需要写入的目录存在
for (const key of ['blogContent', 'achievementImages', 'portfolioImages']) {
    ensureDir(DATA_PATHS[key]);
}

module.exports = {
    MODULE_DIR,
    SITE_ROOT,
    DATA_DIR,
    SITE_PUBLIC_DIR,
    ADMIN_PUBLIC_DIR,
    DATA_PATHS,
    ensureDir,
};
