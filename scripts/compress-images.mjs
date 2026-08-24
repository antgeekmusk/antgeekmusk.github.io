/* ============================================================
 * 构建产物图片压缩脚本（纯 JS / jimp，无原生依赖）
 * 声明：npm run build 时自动执行（vite build && node scripts/compress-images.mjs）
 * 作用：遍历 build/ 下的大图，超过 1600px 宽度的等比缩小；
 *       JPEG/WebP 质量压到 80，PNG 用最高 deflate 压缩；小图跳过
 * ============================================================ */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Jimp } from 'jimp';

const BUILD_DIR = path.resolve(process.cwd(), 'build');
const MAX_WIDTH = 1600;
const JPEG_QUALITY = 80;
const MIN_SIZE = 150 * 1024; // < 150KB 的小图跳过
const IMG_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff']);

/** 递归收集目录下所有图片文件 */
async function walkImages(dir) {
    const result = [];
    let entries;
    try {
        entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
        return result;
    }
    for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            result.push(...await walkImages(full));
        } else if (IMG_EXTS.has(path.extname(ent.name).toLowerCase())) {
            result.push(full);
        }
    }
    return result;
}

/** 处理单张图片：等比缩小 + 按格式压缩 */
async function compressFile(file) {
    const info = await fs.stat(file);
    if (info.size < MIN_SIZE) return null;

    const img = await Jimp.read(file);
    const w = img.bitmap.width;
    const h = img.bitmap.height;
    const ext = path.extname(file).toLowerCase();

    let changed = false;

    // 过宽 → 等比缩小（jimp v1 的 resize 接受对象参数 { w }）
    if (w > MAX_WIDTH && h > 0) {
        img.resize({ w: MAX_WIDTH });
        changed = true;
    }

    const writeOptions = {};
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.webp') {
        writeOptions.quality = JPEG_QUALITY;
        changed = true;
    } else if (ext === '.png') {
        writeOptions.deflateLevel = 9; // 最大无损压缩
        changed = true;
    }

    if (!changed) return null;

    // 备份原文件字节；压缩后若反而变大（原图质量已高于目标），恢复原文件
    const originalBuffer = await fs.readFile(file);
    await img.write(file, writeOptions); // 写回原路径（build 产物）

    const after = await fs.stat(file).catch(() => null);
    const afterSize = after ? after.size : info.size;
    if (afterSize > info.size) {
        await fs.writeFile(file, originalBuffer);
        return { file, before: info.size, after: info.size, saved: 0, skipped: true };
    }
    return { file, before: info.size, after: afterSize, saved: info.size - afterSize };
}

async function main() {
    let stat;
    try {
        stat = await fs.stat(BUILD_DIR);
    } catch {
        console.log('[compress] build/ 不存在，跳过图片压缩');
        return;
    }
    if (!stat.isDirectory()) {
        console.log('[compress] build/ 不是目录，跳过图片压缩');
        return;
    }

    const files = await walkImages(BUILD_DIR);
    let processed = 0;
    let savedTotal = 0;

    for (const file of files) {
        try {
            const result = await compressFile(file);
            if (result) {
                processed++;
                savedTotal += result.saved;
                const rel = path.relative(BUILD_DIR, file);
                console.log(`[compress] ${rel}  ${(result.before / 1024).toFixed(0)}KB → ${(result.after / 1024).toFixed(0)}KB`);
            }
        } catch (e) {
            console.warn(`[compress] 跳过 ${path.relative(BUILD_DIR, file)}: ${e.message}`);
        }
    }

    console.log(`[compress] 完成：处理 ${processed} 张大图，共节省 ${(savedTotal / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((e) => {
    console.error('[compress] 出错：', e);
    process.exit(1);
});