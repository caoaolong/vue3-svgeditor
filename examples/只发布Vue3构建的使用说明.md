# 只发布 Vue3 构建的配置说明

## 已完成的配置

### 1. package.json 修改

- **main** 和 **module** 字段：指向 `dist/vue3/Editor.js`
- **exports** 字段：简化为只导出 Vue3 构建
- **files** 字段：只包含 `dist/vue3` 目录
- **description**：更新为 Vue3 专用描述

### 2. .npmignore 修改

- 添加了 `dist/editor/**` 排除规则，确保标准构建不会被发布

## 使用方式

### 安装

```bash
npm install vue3-svgedit
```

### 在 Vue3 项目中使用

```javascript
// 导入编辑器（默认就是 Vue3 构建）
import Editor from 'vue3-svgedit'
import 'vue3-svgedit/css'

// 使用
const editor = new Editor(containerElement)
await editor.init()
```

**注意**：由于只发布 Vue3 构建，所以：
- `import Editor from 'vue3-svgedit'` 直接就是 Vue3 版本
- 不需要使用 `vue3-svgedit/vue3` 路径
- CSS 路径是 `vue3-svgedit/css`

## 发布步骤

```bash
# 1. 构建
npm run build

# 2. 验证（确保只包含 Vue3 构建）
npm pack --dry-run | grep "dist/editor"  # 应该没有输出

# 3. 更新版本号
npm version patch

# 4. 发布
npm publish
```

## 验证发布内容

发布前可以检查：

```bash
npm pack --dry-run | grep "dist/vue3" | wc -l  # 应该有很多文件
npm pack --dry-run | grep "dist/editor"        # 应该没有输出
```

## 优势

1. **包体积更小**：只包含 Vue3 构建，不包含标准构建
2. **使用更简单**：直接导入，不需要指定 `/vue3` 路径
3. **专为 Vue3 优化**：包名和描述都明确表明是 Vue3 专用

