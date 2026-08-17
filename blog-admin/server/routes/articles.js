/**
 * 文章管理：blogs_config.json + content 目录下的 Markdown 正文与图片。
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { DATA_PATHS, ensureDir } = require('../config');
const {
    readJson, writeJson, readText, writeText, removeDir, sanitizeFileName, decodeUploadName,
    nextId, sortBlogs, parseBlogPath, error, wrap,
} = require('../utils');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

/** 文章列表（含正文文件是否存在的信息） */
router.get('/', wrap((req, res) => {
    const blogs = readJson(DATA_PATHS.blogsConfig, []);
    const withInfo = blogs.map((b) => {
        const { date, id, file } = parseBlogPath(b.path);
        const contentFile = path.join(DATA_PATHS.blogContent, date, id, file);
        return {
            ...b,
            contentExists: fs.existsSync(contentFile),
            articleFolder: file ? path.join(DATA_PATHS.blogContent, date, id) : null,
        };
    });
    res.json(withInfo);
}));

/** 单篇文章（含正文） */
router.get('/:id', wrap((req, res) => {
    const blogs = readJson(DATA_PATHS.blogsConfig, []);
    const blog = blogs.find((b) => String(b.id) === String(req.params.id));
    if (!blog) throw error(404, `文章(id=${req.params.id})不存在`);
    const { date, id, file } = parseBlogPath(blog.path);
    const contentFile = path.join(DATA_PATHS.blogContent, date, id, file);
    res.json({
        ...blog,
        content: fs.existsSync(contentFile) ? readText(contentFile) : '',
    });
}));

/** 新建文章：自动分配 id，创建 content/日期/id/ 目录并写入正文 */
router.post('/', wrap((req, res) => {
    const body = req.body || {};
    const title = sanitizeFileName(body.title, '');
    if (!title) throw error(400, '文章标题不能为空');
    const date = String(body.date || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw error(400, '日期格式不正确，应为 YYYY-MM-DD');

    const blogs = readJson(DATA_PATHS.blogsConfig, []);
    const id = nextId(blogs);
    const fileName = `${title}.md`;
    const folder = path.join(DATA_PATHS.blogContent, date, String(id));
    ensureDir(folder);
    writeText(path.join(folder, fileName), String(body.content || ''));

    const meta = {
        id,
        path: `/${date}/${id}/${fileName}`,
        title,
        description: String(body.description || body.title || ''),
        date,
        columns: Array.isArray(body.columns) ? body.columns : [],
        tags: Array.isArray(body.tags) ? body.tags : [],
        image_text: String(body.image_text || body.title || ''),
    };
    blogs.push(meta);
    writeJson(DATA_PATHS.blogsConfig, sortBlogs(blogs));
    res.status(201).json(meta);
}));

/** 更新文章：支持修改标题/日期（会同步移动目录、重命名正文文件） */
router.put('/:id', wrap((req, res) => {
    const blogs = readJson(DATA_PATHS.blogsConfig, []);
    const index = blogs.findIndex((b) => String(b.id) === String(req.params.id));
    if (index < 0) throw error(404, `文章(id=${req.params.id})不存在`);
    const blog = blogs[index];
    const body = req.body || {};

    const newTitle = sanitizeFileName(body.title, '');
    if (!newTitle) throw error(400, '文章标题不能为空');
    const newDate = String(body.date || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) throw error(400, '日期格式不正确，应为 YYYY-MM-DD');

    const { date: oldDate, id, file: oldFile } = parseBlogPath(blog.path);
    let newFolder = path.join(DATA_PATHS.blogContent, oldDate, id);
    let newFile = oldFile;

    // 日期变化 → 整体移动该文章的目录
    if (oldDate !== newDate) {
        const targetFolder = path.join(DATA_PATHS.blogContent, newDate, id);
        if (fs.existsSync(newFolder)) {
            ensureDir(path.dirname(targetFolder));
            if (fs.existsSync(targetFolder)) removeDir(targetFolder);
            fs.renameSync(newFolder, targetFolder);
        } else {
            ensureDir(targetFolder);
        }
        newFolder = targetFolder;
    }

    // 标题变化 → 重命名正文文件
    const newFileName = `${newTitle}.md`;
    if (oldFile && oldFile !== newFileName) {
        const oldPath = path.join(newFolder, oldFile);
        const newPath = path.join(newFolder, newFileName);
        if (fs.existsSync(oldPath)) fs.renameSync(oldPath, newPath);
    }
    newFile = newFileName;
    writeText(path.join(newFolder, newFile), String(body.content !== undefined ? body.content : ''));

    const meta = {
        id: Number(id),
        path: `/${newDate}/${id}/${newFile}`,
        title: newTitle,
        description: String(body.description || newTitle),
        date: newDate,
        columns: Array.isArray(body.columns) ? body.columns : [],
        tags: Array.isArray(body.tags) ? body.tags : [],
        image_text: String(body.image_text || newTitle),
    };
    blogs[index] = meta;
    writeJson(DATA_PATHS.blogsConfig, sortBlogs(blogs));
    res.json(meta);
}));

/** 删除文章（连同内容目录一起删除） */
router.delete('/:id', wrap((req, res) => {
    const blogs = readJson(DATA_PATHS.blogsConfig, []);
    const index = blogs.findIndex((b) => String(b.id) === String(req.params.id));
    if (index < 0) throw error(404, `文章(id=${req.params.id})不存在`);
    const blog = blogs[index];
    const { date, id } = parseBlogPath(blog.path);
    removeDir(path.join(DATA_PATHS.blogContent, date, id));
    blogs.splice(index, 1);
    writeJson(DATA_PATHS.blogsConfig, blogs);
    res.json({ ok: true, id: blog.id });
}));

/** 上传文章图片 → 保存到该文章所在目录，正文中以相对文件名引用 */
router.post('/:id/images', upload.array('files'), wrap((req, res) => {
    const blogs = readJson(DATA_PATHS.blogsConfig, []);
    const blog = blogs.find((b) => String(b.id) === String(req.params.id));
    if (!blog) throw error(404, `文章(id=${req.params.id})不存在`);
    const { date, id } = parseBlogPath(blog.path);
    const folder = path.join(DATA_PATHS.blogContent, date, id);
    ensureDir(folder);

    const saved = [];
    for (const file of req.files || []) {
        let name = sanitizeFileName(decodeUploadName(file.originalname), `image-${Date.now()}`);
        let target = path.join(folder, name);
        if (fs.existsSync(target)) {
            name = `${Date.now()}-${name}`;
            target = path.join(folder, name);
        }
        fs.writeFileSync(target, file.buffer);
        saved.push({ name, url: `/data/blog/content/${date}/${id}/${name}` });
    }
    res.json({ files: saved });
}));

module.exports = router;
