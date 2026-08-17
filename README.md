# Antgeek's Blog

个人博客站点：基于 React + TypeScript + Vite 构建的静态站点，部署在 GitHub Pages。

站点地址：<https://antgeekmusk.github.io>

## 技术栈

- 前端：React 19 / React Router 7 / Ant Design 5 / Vite 6 / TypeScript
- 内容：Markdown（react-markdown + remark-gfm）
- 数据：静态 JSON + Markdown 文件（位于 `public/data/`）
- 部署：GitHub Pages（`gh-pages` 发布 `build` 目录）

## 目录结构

```
├── public/
│   ├── data/                     # 站点数据（文章、成就、作品集等）
│   │   ├── blog/
│   │   │   ├── blogs_config.json      # 文章元信息（id、path、标题、日期、专栏、Tag）
│   │   │   ├── columns_config.json    # 专栏配置
│   │   │   ├── tag_color_config.json  # Tag 颜色映射
│   │   │   └── content/{日期}/{id}/   # 文章 Markdown 正文 + 图片
│   │   ├── achievement/
│   │   │   ├── achievement.json       # 成就（按年份分组）
│   │   │   ├── myInfo.md              # 成就页个人介绍
│   │   │   └── images/
│   │   ├── portfolio/
│   │   │   ├── portfolio.json         # 作品集（按年份分组）
│   │   │   └── myInfo.md
│   │   └── english_learning/
│   ├── images/                   # 站点公共图片
│   └── ...
├── src/                          # 前端源码
│   ├── pages/                    # 页面（首页 / 文章详情 / 关于我 / 作品集 / 404）
│   ├── components/               # 组件（头部 / 侧边栏 / 列表 / Markdown 渲染等）
│   ├── loaders/                  # 路由数据加载器
│   └── utils/                    # 工具函数
├── scripts/                      # 辅助脚本（Markdown 图片本地化等）
├── blog-admin/                   # 博客后台管理系统（Node.js，详见其 README）
└── index.html / vite.config.ts / tsconfig.json / package.json
```

## 本地开发

```bash
npm install     # 安装依赖
npm start       # 启动 Vite 开发服务器（默认 http://localhost:5173）
```

## 构建与部署

```bash
npm run build   # 构建到 build/ 目录
npm run deploy  # 发布到 GitHub Pages（gh-pages -b main -d build）
```

## 博客后台管理（blog-admin）

仓库内附带了一个 Node.js 前后端一体的博客后台管理工具，打开网页即可管理：

- 📄 文章信息（新建 / 编辑 / 删除，Markdown 正文编辑与预览、图片上传）
- 🏆 成就信息（按年份管理，支持图片）
- 📚 专栏信息（增删改排序，同步更新文章）
- 🏷️ Tag 信息（自动汇总 + 颜色配置）
- 💼 作品集信息、⚙️ 站点设置（个人介绍、数据备份）

```bash
npm run admin   # 启动后台（等价于 cd blog-admin && npm start）
```

然后访问 **http://localhost:3000/admin/** 。

> 后台读写的就是 `public/data/` 下的数据文件，保存后提交代码并部署即可生效。
> 详细说明见 [blog-admin/README.md](./blog-admin/README.md)。

## 数据格式速览

文章（`blogs_config.json`）：

```json
{
  "id": 12,
  "path": "/20250827/12/HDFS 块大小设置及其原则.md",
  "title": "HDFS 块大小设置及其原则",
  "description": "……",
  "date": "2025-08-27",
  "columns": ["大数据", "Hadoop"],
  "tags": ["大数据", "Hadoop"],
  "image_text": "HDFS 块大小设置及其原则"
}
```

- `path` 的规律是 `/日期/id/文件名.md`，正文文件位于 `public/data/blog/content/日期/id/` 下。
- 专栏（`columns_config.json`）与 Tag（`tag_color_config.json`）互相独立，Tag 颜色取 antd 预设色。
