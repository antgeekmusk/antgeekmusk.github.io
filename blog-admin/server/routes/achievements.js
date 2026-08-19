/**
 * 足迹管理：achievement.json（按年份分组）+ myInfo.md + 图片上传。
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { DATA_PATHS, ensureDir } = require('../config');
const { readJson, writeJson, readText, writeText, sanitizeFileName, decodeUploadName, error, wrap } = require('../utils');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

/** 足迹列表 + 个人介绍 */
router.get('/', wrap((req, res) => {
    res.json({
        years: readJson(DATA_PATHS.achievementJson, []),
        myInfo: readText(DATA_PATHS.achievementMyInfo),
    });
}));

/** 新增一条足迹（自动放入/创建对应年份） */
router.post('/', wrap((req, res) => {
    const body = req.body || {};
    const year = String(body.year || '').trim();
    if (!/^\d{4}$/.test(year)) throw error(400, '年份格式不正确，应为 4 位数字');
    const title = String(body.title || '').trim();
    if (!title) throw error(400, '足迹标题不能为空');

    const data = readJson(DATA_PATHS.achievementJson, []);
    let group = data.find((g) => g.year === year);
    if (!group) {
        group = { year, items: [] };
        data.push(group);
    }
    group.items.push({
        title,
        emoji: String(body.emoji || '⭐'),
        description: String(body.description || ''),
        date: String(body.date || `${year}-01-01`),
        tags: Array.isArray(body.tags) ? body.tags : [],
        images: Array.isArray(body.images) ? body.images : [],
    });
    group.items.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    data.sort((a, b) => String(b.year).localeCompare(String(a.year)));
    writeJson(DATA_PATHS.achievementJson, data);
    res.status(201).json(group);
}));

/** 更新某一年中的某条足迹 */
router.put('/:year/:index', wrap((req, res) => {
    const year = req.params.year;
    const index = Number(req.params.index);
    const data = readJson(DATA_PATHS.achievementJson, []);
    const group = data.find((g) => g.year === year);
    if (!group || !group.items[index]) throw error(404, '足迹不存在');
    const body = req.body || {};
    const title = String(body.title || '').trim();
    if (!title) throw error(400, '足迹标题不能为空');

    group.items[index] = {
        title,
        emoji: String(body.emoji || '⭐'),
        description: String(body.description || ''),
        date: String(body.date || ''),
        tags: Array.isArray(body.tags) ? body.tags : [],
        images: Array.isArray(body.images) ? body.images : [],
    };
    group.items.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    data.sort((a, b) => String(b.year).localeCompare(String(a.year)));
    writeJson(DATA_PATHS.achievementJson, data);
    res.json(group);
}));

/** 删除足迹；若该年份没有其他足迹则一并删除年份 */
router.delete('/:year/:index', wrap((req, res) => {
    const year = req.params.year;
    const index = Number(req.params.index);
    const data = readJson(DATA_PATHS.achievementJson, []);
    const group = data.find((g) => g.year === year);
    if (!group || !group.items[index]) throw error(404, '足迹不存在');
    group.items.splice(index, 1);
    if (group.items.length === 0) {
        data.splice(data.indexOf(group), 1);
    }
    writeJson(DATA_PATHS.achievementJson, data);
    res.json({ ok: true });
}));

/** 上传足迹图片 */
router.post('/images', upload.array('files'), wrap((req, res) => {
    ensureDir(DATA_PATHS.achievementImages);
    const saved = [];
    for (const file of req.files || []) {
        let name = sanitizeFileName(decodeUploadName(file.originalname), `image-${Date.now()}`);
        let target = path.join(DATA_PATHS.achievementImages, name);
        if (fs.existsSync(target)) {
            name = `${Date.now()}-${name}`;
            target = path.join(DATA_PATHS.achievementImages, name);
        }
        fs.writeFileSync(target, file.buffer);
        saved.push({ name, url: `/data/achievement/images/${name}` });
    }
    res.json({ files: saved });
}));

/** 保存足迹页个人介绍 */
router.put('/myinfo', wrap((req, res) => {
    const content = String((req.body || {}).content || '');
    writeText(DATA_PATHS.achievementMyInfo, content);
    res.json({ ok: true });
}));

module.exports = router;
