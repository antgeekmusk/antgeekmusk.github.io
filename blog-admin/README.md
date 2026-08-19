# blog-admin · 博客后台管理系统

一个 Node.js 前后端一体的博客管理工具：通过浏览器页面管理本站的文章、足迹、专栏、Tag、作品集等数据。

- 后端：Node.js + Express（REST API，读写站点 `public/data/` 下的数据文件）
- 前端：原生 HTML / CSS / JS（无需构建，打开即用）

## 快速开始

```bash
cd blog-admin
npm install        # 首次使用需要安装依赖
npm start          # 启动服务
```

然后浏览器打开：**http://localhost:3000/admin/**

> 也可以在仓库根目录直接执行 `npm run admin`（等价于 `npm --prefix blog-admin start`）。

### 常用脚本

| 命令 | 说明 |
| --- | --- |
| `npm start` | 启动后台服务（默认端口 3000） |
| `npm run dev` | 启动并监听文件变化自动重启 |

### 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `PORT` | `3000` | 服务监听端口 |
| `BLOG_DATA_DIR` | 仓库根 `/public/data` | 站点数据目录（一般不需要改） |

## 功能

| 模块 | 能力 |
| --- | --- |
| 📄 文章管理 | 查看 / 新建 / 编辑 / 删除文章；编辑 Markdown 正文（带预览）；上传图片到文章目录；修改日期会自动移动文章目录，修改标题会自动重命名正文文件 |
| 👣 足迹管理 | 按年份分组管理足迹（标题、emoji、日期、描述、Tag、图片）；上传足迹图片；编辑足迹页个人介绍 |
| 📚 专栏管理 | 新增 / 重命名 / 排序 / 删除专栏；删除与重命名会同步更新引用它的文章 |
| 🏷️ Tag 管理 | 自动汇总全站 Tag（文章 / 足迹 / 作品集）及使用次数；为 Tag 设置 antd 预设颜色 |
| 💼 作品集管理 | 同足迹管理，额外支持作品页面路由 route 字段 |
| ⚙️ 站点设置 | 编辑足迹页 / 作品集页的 myInfo.md；查看数据目录；下载数据备份 |

## 数据文件说明

后台写入的就是线上站点读取的数据文件，提交代码即可发布：

| 文件 | 内容 |
| --- | --- |
| `public/data/blog/blogs_config.json` | 文章元信息（id、path、标题、日期、专栏、Tag） |
| `public/data/blog/content/{日期}/{id}/*.md` | 文章 Markdown 正文 + 图片 |
| `public/data/blog/columns_config.json` | 专栏配置（name、order） |
| `public/data/blog/tag_color_config.json` | Tag 颜色映射 |
| `public/data/achievement/achievement.json` | 足迹数据（按年份分组） |
| `public/data/portfolio/portfolio.json` | 作品集数据（按年份分组） |
| `public/data/achievement/myInfo.md`、`public/data/portfolio/myInfo.md` | 页面顶部个人介绍 |

## 接口一览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/health` | 健康检查 |
| GET/POST | `/api/articles` | 文章列表 / 新建文章 |
| GET/PUT/DELETE | `/api/articles/:id` | 文章详情（含正文）/ 更新 / 删除 |
| POST | `/api/articles/:id/images` | 上传文章图片 |
| GET/POST | `/api/columns` | 专栏列表 / 新增 |
| PUT/DELETE | `/api/columns/:name` | 更新 / 删除专栏 |
| GET | `/api/tags` | Tag 汇总列表 |
| PUT/DELETE | `/api/tags/:name` | 设置 / 清除 Tag 颜色 |
| GET/POST | `/api/achievements` | 足迹列表 / 新增 |
| PUT/DELETE | `/api/achievements/:year/:index` | 更新 / 删除足迹 |
| POST | `/api/achievements/images` | 上传足迹图片 |
| PUT | `/api/achievements/myinfo` | 保存足迹页个人介绍 |
| GET/POST | `/api/portfolio` | 作品集列表 / 新增 |
| PUT/DELETE | `/api/portfolio/:year/:index` | 更新 / 删除作品 |
| POST | `/api/portfolio/images` | 上传作品图片 |
| PUT | `/api/portfolio/myinfo` | 保存作品集页个人介绍 |
| GET | `/api/settings` | 站点信息 |

## 说明

- 后台服务会以只读方式把站点 `public/` 目录挂到根路径，因此管理页中的图片预览与数据下载路径与线上站点完全一致。
- 所有数据写入均为「先写临时文件再重命名」的原子操作，且不会改变 JSON 的格式（2 空格缩进），避免产生多余的 git diff。
- 数据写在仓库内，提交后部署即可生效；建议部署前先在后台「站点设置」页下载备份。
