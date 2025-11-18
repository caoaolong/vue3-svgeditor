# SVGEdit Documentation

这是 SVGEdit 的完整文档站点，可以部署到 GitHub Pages。

## 目录结构

- `index.html` - 文档首页和导航
- `jsdoc/` - JSDoc 生成的 API 文档
- `tutorials/` - 教程文档（Markdown 格式）
- `versions/` - 版本历史文档

## 部署到 GitHub Pages

### 方法一：使用 GitHub Actions（推荐）

1. 在项目根目录创建 `.github/workflows/docs.yml`：

```yaml
name: Deploy Docs

on:
  push:
    branches:
      - main
    paths:
      - 'docs/**'
      - 'src/**'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build documentation
        run: npm run build-docs
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

### 方法二：手动部署

1. 构建文档：
```bash
npm run build-docs
```

2. 在 GitHub 仓库设置中：
   - 进入 Settings > Pages
   - Source 选择 "Deploy from a branch"
   - Branch 选择 `main` 或 `master`
   - Folder 选择 `/docs`
   - 点击 Save

3. 文档将在 `https://yourusername.github.io/svgedit/` 可用

## 本地预览

```bash
# 构建文档
npm run build-docs

# 启动本地服务器预览
npm run open-docs
```

## 文档更新

每次更新代码后，运行 `npm run build-docs` 重新生成文档。

