/**
 * 通用工具：JSON/文本的原子读写、文件名清洗、博客 path 解析等。
 *
 * 注意：仓库内的数据文件使用 CRLF 换行（git 检出如此），
 * 写入时按原文件换行风格输出，避免产生整文件的无效 diff。
 */
const fs = require('fs');
const path = require('path');
const { ensureDir } = require('./config');

const CRLF = Buffer.from('\r\n');

/** 探测文件换行风格：已有文件按其原风格；新文件默认 CRLF（与仓库现状一致） */
function detectEol(file) {
    try {
        const buf = fs.readFileSync(file);
        if (buf.includes(CRLF)) return '\r\n';
    } catch (e) { /* 文件不存在则用默认值 */ }
    return '\r\n';
}

/** 把文本统一为指定换行风格 */
function normalizeEol(text, eol) {
    return String(text).replace(/\r\n/g, '\n').replace(/\n/g, eol);
}

/** 读取 JSON 文件，文件不存在或内容为空时返回 fallback */
function readJson(file, fallback) {
    try {
        const raw = fs.readFileSync(file, 'utf-8');
        if (!raw.trim()) return fallback;
        return JSON.parse(raw);
    } catch (e) {
        if (e.code === 'ENOENT') return fallback;
        throw e;
    }
}

/** 原子写入 JSON：先写临时文件再重命名，避免写一半损坏数据 */
function writeJson(file, data) {
    ensureDir(path.dirname(file));
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, normalizeEol(stringifySiteJson(data), detectEol(file)), 'utf-8');
    fs.renameSync(tmp, file);
}

/**
 * 站点 JSON 自定义序列化：与仓库现有数据的排版保持一致，
 * 避免每次保存产生整文件的无效 diff。
 *
 * 仓库风格：
 *  - 2 空格缩进，对象多行，键值间 "key": value；
 *  - 数组如果是纯标量（字符串/数字/布尔）则写成一行 ["a","b"]（不加空格）；
 *  - 数组元素为对象时多行展开（与 JSON.stringify 缩进一致）。
 */
function stringifySiteJson(value) {
    const pad = (n) => '  '.repeat(n);
    const isPrimitive = (v) => v === null || ['string', 'number', 'boolean'].includes(typeof v);

    function ser(v, depth) {
        if (v === null) return 'null';
        const t = typeof v;
        if (t === 'number' || t === 'boolean') return String(v);
        if (t === 'string') return JSON.stringify(v);
        if (Array.isArray(v)) {
            if (v.length === 0) return '[]';
            if (v.every(isPrimitive)) {
                return '[' + v.map((x) => ser(x, depth)).join(',') + ']';
            }
            const inner = v.map((x) => pad(depth + 1) + ser(x, depth + 1)).join(',\n');
            return '[\n' + inner + '\n' + pad(depth) + ']';
        }
        if (t === 'object') {
            const keys = Object.keys(v);
            if (keys.length === 0) return '{}';
            const inner = keys
                .map((k) => pad(depth + 1) + JSON.stringify(k) + ': ' + ser(v[k], depth + 1))
                .join(',\n');
            return '{\n' + inner + '\n' + pad(depth) + '}';
        }
        return String(v);
    }
    return ser(value, 0);
}

/** 读取文本文件，不存在返回空字符串 */
function readText(file) {
    try {
        return fs.readFileSync(file, 'utf-8');
    } catch (e) {
        if (e.code === 'ENOENT') return '';
        throw e;
    }
}

/** 原子写入文本文件（按原文件换行风格） */
function writeText(file, content) {
    ensureDir(path.dirname(file));
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, normalizeEol(content, detectEol(file)), 'utf-8');
    fs.renameSync(tmp, file);
}

/** 递归删除目录或文件 */
function removeDir(dir) {
    fs.rmSync(dir, { recursive: true, force: true });
}

/** 去除文件名中的非法字符（Windows 也适用），为空时返回 fallback */
function sanitizeFileName(name, fallback = 'untitled') {
    const cleaned = String(name || '')
        .replace(/[\\/:*?"<>|\r\n\t]/g, '')
        .trim();
    return cleaned || fallback;
}

/** 生成下一个自增 id */
function nextId(list) {
    const max = list.reduce((m, item) => Math.max(m, Number(item.id) || 0), 0);
    return max + 1;
}

/** 博客列表排序：日期倒序，id 倒序 */
function sortBlogs(blogs) {
    return [...blogs].sort((a, b) => {
        if (a.date !== b.date) return String(b.date).localeCompare(String(a.date));
        return (Number(b.id) || 0) - (Number(a.id) || 0);
    });
}

/** 解析博客 path（形如 /20250521/1/标题.md） */
function parseBlogPath(blogPath) {
    const parts = String(blogPath || '').split('/').filter(Boolean);
    return { date: parts[0] || '', id: parts[1] || '', file: parts.slice(2).join('/') };
}

/** 构造统一的业务错误 */
function error(status, message) {
    const err = new Error(message);
    err.status = status;
    return err;
}

/** 异步路由包装器，把异常统一转成 JSON 错误响应 */
function wrap(fn) {
    return (req, res) => {
        try {
            const result = fn(req, res);
            if (result && typeof result.catch === 'function') {
                result.catch((e) => handleError(e, res));
            }
        } catch (e) {
            handleError(e, res);
        }
    };
}

function handleError(e, res) {
    if (e && e.status) {
        return res.status(e.status).json({ error: e.message });
    }
    console.error(e);
    res.status(500).json({ error: '服务器内部错误: ' + e.message });
}

module.exports = {
    readJson,
    writeJson,
    readText,
    writeText,
    removeDir,
    sanitizeFileName,
    nextId,
    sortBlogs,
    parseBlogPath,
    error,
    wrap,
};
