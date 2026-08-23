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
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024, files: 50 } });

const IMAGE_PREFIX = '/data/achievement/images/';
/** 前端暂存图片在 images 数组中的占位标记，如 __temp__0 对应 multipart 第 0 个文件 */
const TEMP_TOKEN = '__temp__';

/** 图片扩展名兜底：剪贴板粘贴的图片可能没有文件后缀，按 MIME 推断 */
const EXT_BY_MIME = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'image/bmp': '.bmp',
    'image/avif': '.avif',
};

/** 解析可能来自 multipart（字符串 JSON）或 JSON body（数组）的字段 */
function parseJsonField(value, fallback) {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.trim()) {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : fallback;
        } catch (e) { /* 忽略非法 JSON */ }
    }
    return fallback;
}

/** 足迹列表 + 个人介绍 */
router.get('/', wrap((req, res) => {
    res.json({
        years: readJson(DATA_PATHS.achievementJson, []),
        myInfo: readText(DATA_PATHS.achievementMyInfo),
    });
}));

/** 新增一条足迹（自动放入/创建对应年份）；multipart 或 JSON 均可 */
router.post('/', upload.array('files'), wrap((req, res) => {
    const body = req.body || {};
    const year = String(body.year || '').trim();
    if (!/^\d{4}$/.test(year)) throw error(400, '年份格式不正确，应为 4 位数字');
    const title = String(body.title || '').trim();
    if (!title) throw error(400, '足迹标题不能为空');

    // 图片只在保存时统一落盘，并全部按「标题_序号」命名
    const images = persistImages(parseJsonField(body.images, []), req.files, title);
    const item = {
        title,
        emoji: String(body.emoji || '⭐'),
        description: String(body.description || ''),
        date: String(body.date || `${year}-01-01`),
        tags: parseJsonField(body.tags, []),
        images,
    };

    const data = readJson(DATA_PATHS.achievementJson, []);
    let group = data.find((g) => g.year === year);
    if (!group) {
        group = { year, items: [] };
        data.push(group);
    }
    group.items.push(item);
    group.items.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    data.sort((a, b) => String(b.year).localeCompare(String(a.year)));
    writeJson(DATA_PATHS.achievementJson, data);
    res.status(201).json(group);
}));

/** 更新某一年中的某条足迹；multipart 或 JSON 均可 */
router.put('/:year/:index', upload.array('files'), wrap((req, res) => {
    const year = req.params.year;
    const index = Number(req.params.index);
    const data = readJson(DATA_PATHS.achievementJson, []);
    const group = data.find((g) => g.year === year);
    if (!group || !group.items[index]) throw error(404, '足迹不存在');
    const body = req.body || {};
    const title = String(body.title || '').trim();
    if (!title) throw error(400, '足迹标题不能为空');

    // 图片只在保存时统一落盘，并全部按「标题_序号」命名
    const images = persistImages(parseJsonField(body.images, []), req.files, title);
    group.items[index] = {
        title,
        emoji: String(body.emoji || '⭐'),
        description: String(body.description || ''),
        date: String(body.date || ''),
        tags: parseJsonField(body.tags, []),
        images,
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

/**
 * 上传足迹图片：按「标题_序号」重命名。
 * 表单字段：title（足迹标题）、startIndex（本次编号起点，前端传当前图片数 + 1，
 * 便于多次分批上传时序号连续）；同名文件自动顺延序号，绝不覆盖已有文件。
 */
router.post('/images', upload.array('files'), wrap((req, res) => {
    ensureDir(DATA_PATHS.achievementImages);
    const body = req.body || {};
    const title = sanitizeFileName(String(body.title || '').trim(), 'image');
    let seq = Math.max(1, Number(body.startIndex) || 1);
    const saved = [];
    for (const file of req.files || []) {
        const rawName = decodeUploadName(file.originalname) || '';
        const ext = path.extname(rawName) || EXT_BY_MIME[file.mimetype] || '.png';
        let name = `${title}_${seq}${ext}`;
        let target = path.join(DATA_PATHS.achievementImages, name);
        while (fs.existsSync(target)) { // 序号被占用时顺延
            seq += 1;
            name = `${title}_${seq}${ext}`;
            target = path.join(DATA_PATHS.achievementImages, name);
        }
        fs.writeFileSync(target, file.buffer);
        saved.push({ name, url: IMAGE_PREFIX + name });
        seq += 1;
    }
    res.json({ files: saved });
}));

/**
 * 保存足迹时统一落盘图片（仅在用户点击「保存」后执行）：
 * - images 中的 `__temp__k` 占位对应 multipart 第 k 个文件，写入「标题_序号.扩展名」；
 * - 本地已有图片（/data/achievement/images/ 下）按最终展示顺序重命名为「标题_序号」，
 *   名称已正确的直接跳过（例如仅改描述时不会产生任何文件改动）；
 * - 外部 / 其他目录的 URL 原样保留。
 * 返回最终 images URL 数组。
 *
 * 重命名采用两阶段（先改为临时名再改为目标名），避免序号轮换时互相覆盖；
 * 目标名被占用（如与其他足迹同名图片）时追加时间戳前缀，绝不覆盖已有文件；
 * 任一环节失败时尽力回滚已完成的改名与写入，再抛出异常。
 */
function persistImages(images, files, title) {
    if (!Array.isArray(images)) return [];
    const dir = DATA_PATHS.achievementImages;
    ensureDir(dir);
    const base = sanitizeFileName(String(title || '').trim(), 'image');
    const fileList = Array.isArray(files) ? files : [];
    const stamp = Date.now();
    const result = [];
    const moves = [];  // { tmp, final, orig, idx } 已有图片的重命名
    const writes = []; // { final, buffer, idx } 新图片的写入

    images.forEach((entry, idx) => {
        const pos = idx + 1;
        if (typeof entry === 'string' && entry.startsWith(TEMP_TOKEN)) {
            const k = Number(entry.slice(TEMP_TOKEN.length));
            const file = fileList[k];
            if (!file) throw error(400, '临时图片数据缺失，请重新添加后保存');
            const ext = path.extname(decodeUploadName(file.originalname) || '') || EXT_BY_MIME[file.mimetype] || '.png';
            writes.push({ final: `${base}_${pos}${ext}`, buffer: file.buffer, idx });
            result.push(null);
        } else if (typeof entry === 'string' && entry.startsWith(IMAGE_PREFIX)) {
            const oldName = entry.slice(IMAGE_PREFIX.length);
            if (!oldName || oldName.includes('/')) { result.push(entry); return; }
            const source = path.join(dir, oldName);
            if (!fs.existsSync(source)) { result.push(entry); return; }
            const final = `${base}_${pos}${path.extname(oldName)}`;
            if (final === oldName) { result.push(entry); return; } // 名称已正确，无需改动
            const tmp = `.renaming-${stamp}-${idx}-${oldName}`;
            try {
                fs.renameSync(source, path.join(dir, tmp));
            } catch (e) { // 罕见 IO 错误：保持原样
                result.push(entry);
                return;
            }
            moves.push({ tmp, final, orig: oldName, idx });
            result.push(null);
        } else {
            result.push(entry); // 外部 / 其他目录 URL 原样保留
        }
    });

    try {
        // 先完成已有图片的重命名（腾出目标名），再写入新图片
        for (const m of moves) {
            let final = m.final;
            let target = path.join(dir, final);
            if (fs.existsSync(target)) {
                final = `${Date.now()}-${final}`;
                target = path.join(dir, final);
            }
            fs.renameSync(path.join(dir, m.tmp), target);
            result[m.idx] = IMAGE_PREFIX + final;
        }
        for (const w of writes) {
            let final = w.final;
            let target = path.join(dir, final);
            if (fs.existsSync(target)) {
                final = `${Date.now()}-${final}`;
                target = path.join(dir, final);
            }
            fs.writeFileSync(target, w.buffer);
            result[w.idx] = IMAGE_PREFIX + final;
        }
    } catch (e) {
        // 尽力回滚：恢复已改名的文件、删除已写入的新文件
        for (const m of moves) {
            try {
                const tmpPath = path.join(dir, m.tmp);
                if (fs.existsSync(tmpPath)) fs.renameSync(tmpPath, path.join(dir, m.orig));
            } catch (e2) { /* 回滚失败则保留现场 */ }
        }
        for (const w of writes) {
            try {
                const p = path.join(dir, w.final);
                if (fs.existsSync(p)) fs.unlinkSync(p);
            } catch (e2) { /* ignore */ }
        }
        throw e;
    }
    return result;
}

/** 保存足迹页个人介绍 */
router.put('/myinfo', wrap((req, res) => {
    const content = String((req.body || {}).content || '');
    writeText(DATA_PATHS.achievementMyInfo, content);
    res.json({ ok: true });
}));

module.exports = router;
