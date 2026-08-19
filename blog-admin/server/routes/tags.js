/**
 * Tag 管理：tag_color_config.json 的读写 + 全站 Tag 使用统计。
 */
const express = require('express');
const { DATA_PATHS } = require('../config');
const { readJson, writeJson, error, wrap } = require('../utils');

const router = express.Router();

/** antd Tag 预设颜色（与前端 antd 组件一致） */
const VALID_COLORS = ['magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple'];

/** 收集全站（文章/足迹/作品集）所有用到的 Tag */
function collectAllTags() {
    const usage = {};
    const add = (tag) => { usage[tag] = (usage[tag] || 0) + 1; };

    readJson(DATA_PATHS.blogsConfig, []).forEach((b) => (b.tags || []).forEach(add));
    readJson(DATA_PATHS.achievementJson, []).forEach((year) => (year.items || []).forEach((item) => (item.tags || []).forEach(add)));
    readJson(DATA_PATHS.portfolioJson, []).forEach((year) => (year.items || []).forEach((item) => (item.tags || []).forEach(add)));
    return usage;
}

/** Tag 列表：全站用到的 Tag + 颜色配置，按使用次数排序 */
router.get('/', wrap((req, res) => {
    const usage = collectAllTags();
    const colors = readJson(DATA_PATHS.tagColorConfig, {});
    const names = new Set([...Object.keys(usage), ...Object.keys(colors)]);
    const list = Array.from(names)
        .map((name) => ({ name, usage: usage[name] || 0, color: colors[name] || '' }))
        .sort((a, b) => b.usage - a.usage || a.name.localeCompare(b.name, 'zh-CN'));
    res.json(list);
}));

/** 设置某个 Tag 的颜色（color 为空字符串则视为清除） */
router.put('/:name', wrap((req, res) => {
    const name = req.params.name;
    const color = String((req.body || {}).color || '').trim();
    const colors = readJson(DATA_PATHS.tagColorConfig, {});
    if (!color) {
        delete colors[name];
    } else {
        if (!VALID_COLORS.includes(color)) {
            throw error(400, `颜色必须是 antd 预设色之一: ${VALID_COLORS.join(', ')}`);
        }
        colors[name] = color;
    }
    writeJson(DATA_PATHS.tagColorConfig, colors);
    res.json({ name, color });
}));

/** 删除某个 Tag 的颜色配置 */
router.delete('/:name', wrap((req, res) => {
    const name = req.params.name;
    const colors = readJson(DATA_PATHS.tagColorConfig, {});
    delete colors[name];
    writeJson(DATA_PATHS.tagColorConfig, colors);
    res.json({ ok: true });
}));

module.exports = router;
