# 发布到 npm 仓库指南

## 准备工作

### 1. 确保已登录 npm

```bash
npm login
```

如果还没有 npm 账号，请先注册：
- 访问 https://www.npmjs.com/signup
- 或者使用 `npm adduser` 命令

### 2. 检查包名是否可用

如果你想使用不同的包名（当前是 `svgedit`），需要检查是否可用：

```bash
npm search svgedit
```

如果包名已被占用，你可以在 `package.json` 中修改 `name` 字段，例如：
- `@your-username/svgedit`
- `svgedit-vue3`
- `your-custom-name`

### 3. 构建项目

确保项目已经构建完成：

```bash
npm run build
```

验证构建输出：

```bash
# 检查 dist 目录
ls -la dist/

# 检查 Vue3 构建
ls -la dist/vue3/
ls -la dist/vue3/extensions/
```

## 发布步骤

### 方式一：发布到公共 npm 仓库（推荐）

#### 1. 更新版本号

根据你的更改类型更新版本号：

```bash
# 补丁版本（bug 修复）
npm version patch

# 小版本（新功能）
npm version minor

# 大版本（破坏性更改）
npm version major
```

或者手动编辑 `package.json` 中的 `version` 字段。

#### 2. 发布

```bash
npm publish
```

如果是首次发布，可能需要添加 `--access public`（如果包名包含作用域）：

```bash
npm publish --access public
```

### 方式二：发布到私有 npm 仓库

如果你有私有 npm 仓库（如公司内部仓库），需要配置 registry：

```bash
# 设置 registry
npm config set registry https://your-private-registry.com

# 登录
npm login --registry=https://your-private-registry.com

# 发布
npm publish --registry=https://your-private-registry.com
```

### 方式三：发布到 GitHub Packages

如果你想发布到 GitHub Packages：

1. 在 `package.json` 中添加：

```json
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

2. 创建 `.npmrc` 文件：

```
@your-username:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

3. 发布：

```bash
npm publish
```

## 发布后使用

### 在其他项目中安装

```bash
npm install svgedit
# 或
yarn add svgedit
# 或
pnpm add svgedit
```

### 在 Vue3 项目中使用

```javascript
import Editor from 'svgedit/vue3'
import 'svgedit/vue3/css'

// 使用编辑器
const editor = new Editor(containerElement)
await editor.init()
```

## 更新版本

当你需要发布新版本时：

1. 修改代码
2. 运行 `npm run build` 构建
3. 更新版本号：`npm version patch|minor|major`
4. 发布：`npm publish`

## 验证发布

发布后，可以通过以下方式验证：

```bash
# 查看包信息
npm view svgedit

# 安装测试
npm install svgedit --dry-run

# 在临时目录测试
mkdir /tmp/test-svgedit
cd /tmp/test-svgedit
npm init -y
npm install svgedit
```

## 重要提示

1. **版本号**：遵循语义化版本（Semantic Versioning）
   - MAJOR.MINOR.PATCH
   - 例如：7.3.8 → 7.3.9 (patch), 7.4.0 (minor), 8.0.0 (major)

2. **构建输出**：确保 `dist` 目录包含所有必要的文件：
   - `dist/editor/` - 标准构建
   - `dist/vue3/` - Vue3 构建
   - `dist/vue3/extensions/` - Vue3 扩展

3. **测试**：发布前建议在本地测试：
   ```bash
   npm pack
   # 这会生成一个 .tgz 文件，可以在本地测试安装
   ```

4. **README**：确保 README.md 包含使用说明

5. **许可证**：确保 LICENSE 文件存在

## 常见问题

### Q: 发布时提示包名已存在？

A: 需要修改 `package.json` 中的 `name` 字段，使用唯一的包名。

### Q: 如何撤销已发布的版本？

A: 如果版本发布后 72 小时内，可以撤销：
```bash
npm unpublish svgedit@版本号
```

### Q: 如何发布 beta 版本？

A: 使用预发布版本号：
```bash
npm version 7.3.9-beta.1
npm publish --tag beta
```

安装时使用：
```bash
npm install svgedit@beta
```

### Q: 发布后如何更新？

A: 修改代码 → 构建 → 更新版本号 → 发布：
```bash
npm run build
npm version patch
npm publish
```

## 检查清单

发布前请确认：

- [ ] 代码已构建（`npm run build`）
- [ ] `dist` 目录包含所有必要文件
- [ ] `dist/vue3` 目录存在且包含扩展
- [ ] `package.json` 中的版本号已更新
- [ ] `package.json` 中的 `files` 字段正确
- [ ] README.md 包含使用说明
- [ ] LICENSE 文件存在
- [ ] 已登录 npm（`npm whoami`）
- [ ] 包名可用或已修改

