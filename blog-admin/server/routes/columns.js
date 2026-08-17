/**
 * 专栏管理：columns_config.json，改名/删除时会同步更新文章中的专栏引用。
 */
const express = require('express');
const { DATA_PATHS } = require('../config');
const { readJson, writeJson, error, wrap } = require('../utils');

const router = express.Router();

/** 统计每个专栏在文章中的出现次数 */
function computeColumnStats() {
    const blogs = readJson(DATA_PATHS.blogsConfig, []);
    const counts = {};
    blogs.forEach((b) => (b.columns || []).forEach((c) => { counts[c] = (counts[c] || 0) + 1; }));
    return counts;
}

/** 专栏列表（含文章数） */
router.get('/', wrap((req, res) => {
    const config = readJson(DATA_PATHS.columnsConfig, []);
    const counts = computeColumnStats();
    res.json(config.map((c) => ({ ...c, articleCount: counts[c.name] || 0 })));
}));

/** 新增专栏 */
router.post('/', wrap((req, res) => {
    const name = String((req.body || {}).name || '').trim();
    if (!name) throw error(400, '专栏名称不能为空');
    const config = readJson(DATA_PATHS.columnsConfig, []);
    if (config.some((c) => c.name === name)) throw error(409, `专栏「${name}」已存在`);
    const order = Number((req.body || {}).order) || 1;
    config.push({ name, order });
    writeJson(DATA_PATHS.columnsConfig, config);
    res.status(201).json({ name, order, articleCount: 0 });
}));

/** 更新专栏（改名 / 调整排序） */
router.put('/:name', wrap((req, res) => {
    const oldName = req.params.name;
    const config = readJson(DATA_PATHS.columnsConfig, []);
    const index = config.findIndex((c) => c.name === oldName);
    if (index < 0) throw error(404, `专栏「${oldName}」不存在`);
    const body = req.body || {};

    let newName = oldName;
    if (body.name !== undefined) {
        newName = String(body.name).trim();
        if (!newName) throw error(400, '专栏名称不能为空');
        if (newName !== oldName && config.some((c) => c.name === newName)) {
            throw error(409, `专栏「${newName}」已存在`);
        }
    }
    const order = body.order !== undefined ? (Number(body.order) || 1) : config[index].order;
    config[index] = { name: newName, order };
    writeJson(DATA_PATHS.columnsConfig, config);

    // 同步更新文章中的专栏引用
    const blogs = readJson(DATA_PATHS.blogsConfig, []);
    let affected = 0;
    blogs.forEach((b) => {
        if ((b.columns || []).includes(oldName)) {
            b.columns = b.columns.map((c) => (c === oldName ? newName : c));
            affected++;
        }
    });
    if (affected > 0) writeJson(DATA_PATHS.blogsConfig, blogs);

    res.json({ name: newName, order, affectedArticles: affected });
}));

/** 删除专栏（同时从所有文章中移除该专栏） */
router.delete('/:name', wrap((req, res) => {
    const name = req.params.name;
    const config = readJson(DATA_PATHS.columnsConfig, []);
    const index = config.findIndex((c) => c.name === name);
    if (index < 0) throw error(404, `专栏「${name}」不存在`);
    config.splice(index, 1);
    writeJson(DATA_PATHS.columnsConfig, config);

    const blogs = readJson(DATA_PATHS.blogsConfig, []);
    const affectedTitles = [];
    blogs.forEach((b) => {
        if ((b.columns || []).includes(name)) {
            b.columns = (b.columns || []).filter((c) => c !== name);
            affectedTitles.push(b.title);
        }
    });
    if (affectedTitles.length > 0) writeJson(DATA_PATHS.blogsConfig, blogs);

    res.json({ ok: true, affectedArticles: affectedTitles });
}));

module.exports = router;
