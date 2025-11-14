# @snowui-design-system/resource-core

## 项目简介

`@snowui-design-system/resource-core` 是 SnowUI 设计资源核心包，负责统一管理和处理所有设计素材（图标、头像、背景、光标等）。该包提供了自动化工具链，能够：

- **批量处理设计素材**：自动扫描、重命名、压缩和优化各类素材文件
- **图标管理**：支持多权重图标（regular、thin、light、bold、fill、duotone），并进行颜色标准化处理
- **素材分类**：按类型组织素材（avatars、backgrounds、cursors、emoji、icons、illustrations、images、logos）
- **文件标准化**：统一文件命名规范（kebab-case），确保命名一致性
- **压缩优化**：自动压缩位图（PNG、JPG、WebP）和 SVG 文件，减小文件体积
- **元数据生成**：自动生成图标和素材的元数据文件，便于程序化访问

## 快速开始

### 安装

```bash
# npm
npm install @snowui-design-system/resource-core

# pnpm
pnpm add @snowui-design-system/resource-core

# yarn
yarn add @snowui-design-system/resource-core
```

### 使用

#### 导入元数据

```typescript
import { icons, assets, findIcon, findAsset } from '@snowui-design-system/resource-core';

// 获取所有图标
console.log(icons);

// 查找图标
const icon = findIcon('four-leaf-clover');
console.log(icon?.weights); // ['regular', 'thin', 'light', 'bold', 'fill', 'duotone']

// 查找素材
const asset = findAsset('avatar-byewind');
console.log(asset?.type); // 'avatars'
```

#### 直接导入资源文件

```typescript
// 导入图标 SVG
import iconSvg from '@snowui-design-system/resource-core/assets/icons/regular/four-leaf-clover-regular.svg';

// 或使用简化路径
import iconSvg from '@snowui-design-system/resource-core/regular/four-leaf-clover-regular.svg';

// 导入素材
import avatar from '@snowui-design-system/resource-core/assets/avatars/avatar-byewind.png';
import background from '@snowui-design-system/resource-core/assets/backgrounds/gradient-01.jpg';
import emoji from '@snowui-design-system/resource-core/assets/emoji/face-blowing-kiss.svg';
import logo from '@snowui-design-system/resource-core/assets/logos/google.svg';
```

## 项目执行方法

### 处理所有素材和图标

```bash
# 在 resource/core 目录下执行
npm run process
# 或
npx tsx scripts/process-all.ts
```

### 仅处理素材（排除图标）

```bash
npm run process:materials
# 或
npx tsx scripts/process-materials.ts
```

### 仅处理图标

```bash
npm run process:icons
# 或
npx tsx scripts/process-icons.ts
```

### 预览模式（不实际写入文件）

```bash
npx tsx scripts/process-all.ts --dry
```

## 技术栈与环境

### 编写语言

- **TypeScript**：所有脚本使用 TypeScript 编写，提供类型安全

### 运行环境

- **Node.js**：需要 Node.js 18.x 或更高版本
- **包管理器**：推荐使用 `pnpm`（也支持 npm 或 yarn）

### 环境搭建

1. **安装 Node.js**
   ```bash
   # 检查 Node.js 版本（需要 >= 18.0.0）
   node --version
   ```

2. **安装 pnpm**（如果尚未安装）
   ```bash
   npm install -g pnpm
   ```

3. **安装项目依赖**
   ```bash
   cd resource/core
   pnpm install
   ```

4. **运行处理脚本**
   ```bash
   npm run process
   ```

## 依赖的库或包

### 核心依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| `sharp` | ^0.33.0 | 位图图片压缩（PNG、JPG、WebP） |
| `svgo` | ^3.0.0 | SVG 文件优化和压缩 |

### 安装方式

```bash
# 在 resource/core 目录下
pnpm add -D sharp svgo

# 或者在工作区根目录（推荐）
cd /path/to/snowui
pnpm add -D -w sharp svgo
```

### 运行时依赖

脚本使用 `tsx` 运行 TypeScript 文件，如果全局未安装，可以通过 `npx` 调用：

```bash
# 使用 npx（推荐，无需全局安装）
npx tsx scripts/process-all.ts

# 或全局安装 tsx
npm install -g tsx
tsx scripts/process-all.ts
```

## 项目结构

```
resource/core/
├── assets/              # 素材资源目录
│   ├── avatars/         # 头像素材
│   │   ├── original/    # 原始文件目录
│   │   └── *.png        # 处理后的文件
│   ├── backgrounds/     # 背景素材
│   ├── cursors/         # 光标素材
│   ├── emoji/           # 表情素材
│   ├── icons/           # 图标素材
│   │   ├── original/    # 原始文件目录
│   │   ├── regular/     # regular 权重图标
│   │   ├── thin/        # thin 权重图标
│   │   ├── light/       # light 权重图标
│   │   ├── bold/        # bold 权重图标
│   │   ├── fill/        # fill 权重图标
│   │   └── duotone/     # duotone 权重图标
│   ├── illustrations/   # 插画素材
│   ├── images/          # 图片素材
│   └── logos/           # Logo 素材
├── scripts/             # 处理脚本目录
│   ├── process-all.ts   # 统一处理入口
│   ├── process-icons.ts # 图标处理脚本
│   ├── process-materials.ts # 素材处理脚本
│   ├── utils/           # 工具函数
│   │   ├── catalog.ts   # 目录生成工具
│   │   ├── fs.ts        # 文件系统工具
│   │   ├── naming.ts    # 命名转换工具
│   │   ├── svg.ts       # SVG 处理工具
│   │   └── image.ts     # 图片压缩工具
│   └── types/           # 类型定义
│       └── node-shim.d.ts
├── src/                 # 源代码目录
│   ├── icons.ts         # 图标元数据（自动生成）
│   ├── assets.ts        # 素材元数据（自动生成）
│   ├── types.ts         # TypeScript 类型定义
│   └── index.ts         # 导出入口
└── package.json         # 项目配置
```

## 文件作用说明

### 主脚本文件

#### `scripts/process-all.ts`
**作用**：统一处理所有素材和图标的入口脚本

**功能**：
- 按顺序处理 materials 和 icons
- 提供统一的日志输出
- 支持 dry-run 模式预览

**使用场景**：日常开发中处理所有素材的主要入口

---

#### `scripts/process-materials.ts`
**作用**：处理设计素材（头像、背景、光标等，排除图标）

**功能**：
- 扫描 `assets/<类别>/` 目录下的所有文件（包括 `original/` 子目录和直接放置的文件）
- 自动发现所有素材类别（avatars、backgrounds、cursors、emoji、illustrations、images、logos）
- 对位图格式（PNG、JPG、WebP）进行压缩
- 对 SVG 文件进行优化（不进行颜色处理）
- 统一重命名为 kebab-case 格式
- 输出到 `assets/<类别>/<kebab-name>.<ext>`

**处理规则**：
- 位图格式：压缩优化
- SVG 格式：优化但不改变颜色
- 排除 icons 文件夹

---

#### `scripts/process-icons.ts`
**作用**：处理图标文件，支持多权重管理

**功能**：
- 扫描 `assets/icons/original/` 目录
- 识别图标权重（regular、thin、light、bold、fill、duotone）
- 对 SVG 进行颜色标准化处理（替换为 `currentColor`）
- 优化和压缩 SVG 文件
- 按权重分类输出到 `assets/icons/<weight>/<kebab-name>-<weight>.svg`

**处理规则**：
- SVG 颜色处理：将固定颜色（如 `#000`）替换为 `currentColor`
- 自动注入 `fill="currentColor"` 属性
- 使用 svgo 进行优化压缩

---

### 工具函数文件

#### `scripts/utils/catalog.ts`
**作用**：生成图标和素材的元数据文件

**主要功能**：
- 生成 `src/icons.ts`：包含所有图标的元数据
- 生成 `src/assets.ts`：包含所有素材的元数据
- 支持别名（alias）机制，允许通过原始名称和规范名称引用

---

#### `scripts/utils/fs.ts`
**作用**：文件系统操作工具函数

**主要函数**：
- `listAssets(dir, exts, recursive)`: 扫描目录，按扩展名过滤文件
- `readTextFiles(files)`: 批量读取文本文件
- `copyFile(src, dest)`: 复制文件
- `writeFile(dest, contents)`: 写入文件
- `ensureDir(dir)`: 确保目录存在
- `resolvePath(...segments)`: 解析绝对路径

**使用场景**：所有需要文件操作的脚本都会使用这些工具函数

---

#### `scripts/utils/naming.ts`
**作用**：文件名命名转换工具

**主要函数**：
- `toNameVariants(raw)`: 将原始文件名转换为多种命名格式

**转换规则**：
- 输入：`Avatar3D01`、`Paint Brush`、`cursor-text`
- 输出：
  - `kebab`: `avatar-3d-01`、`paint-brush`、`cursor-text`
  - `pascal`: `Avatar3d01`、`PaintBrush`、`CursorText`
  - `original`: 保留原始名称
  - `alias`: 如果转换后与原始名称不同，提供别名信息

**使用场景**：统一文件命名规范，确保所有素材使用一致的命名格式

---

#### `scripts/utils/svg.ts`
**作用**：SVG 文件处理和优化工具

**主要函数**：
- `processSvgColors(svgString)`: 将固定颜色替换为 `currentColor`
- `optimizeSvg(svgString)`: 使用 svgo 优化 SVG
- `processSvgFile(inputPath)`: 完整的 SVG 处理流程

**处理流程**：
1. 颜色处理：`#000`、`black` 等 → `currentColor`
2. 属性注入：自动添加 `fill="currentColor"`
3. 优化压缩：使用 svgo 减小文件体积

**使用场景**：仅用于处理 icons 文件夹中的 SVG 文件

---

#### `scripts/utils/image.ts`
**作用**：位图图片压缩工具

**主要函数**：
- `isBitmapFile(filePath)`: 判断文件是否为位图格式
- `compressImage(inputPath, outputPath)`: 使用 sharp 压缩图片
- `processImageFile(inputPath)`: 完整的图片处理流程

**支持的格式**：
- PNG：使用 `compressionLevel: 9` 进行无损压缩
- JPEG：使用 `quality: 85` 进行有损压缩
- WebP：使用 `quality: 85` 进行有损压缩

**压缩效果**：
- 显示压缩前后的文件大小
- 计算压缩率百分比
- 如果 sharp 未安装，会给出明确的错误提示

**使用场景**：处理 materials 文件夹中的位图文件（排除 icons）

---

#### `scripts/types/node-shim.d.ts`
**作用**：TypeScript 类型定义文件

**功能**：为脚本提供必要的 Node.js 类型定义，避免依赖完整的 `@types/node`

---

## 处理流程说明

### 素材处理流程（process-materials.ts）

1. **扫描原始文件**
   - 遍历 `assets/<类别>/` 目录（包括 `original/` 子目录和直接放置的文件）
   - 过滤出 `.svg`、`.png`、`.jpg`、`.jpeg`、`.webp` 文件

2. **命名转换**
   - 使用 `toNameVariants` 转换为 kebab-case
   - 生成输出路径：`assets/<类别>/<kebab-name>.<ext>`

3. **文件处理**
   - **位图格式**（PNG、JPG、WebP）：使用 sharp 压缩
   - **SVG 格式**：使用 svgo 优化（不进行颜色处理）

4. **输出文件**
   - 写入处理后的文件到目标目录
   - 收集元数据信息

### 图标处理流程（process-icons.ts）

1. **扫描原始文件**
   - 遍历 `assets/icons/original/` 目录
   - 过滤出 `.svg` 文件

2. **权重识别**
   - 从文件名识别权重：`-regular`、`-thin`、`-light`、`-bold`、`-fill`、`-duotone`
   - 默认权重：`regular`

3. **命名转换**
   - 去除权重后缀，转换为 kebab-case
   - 生成输出路径：`assets/icons/<weight>/<kebab-name>-<weight>.svg`

4. **SVG 处理**
   - 颜色处理：固定颜色 → `currentColor`
   - 属性注入：添加 `fill="currentColor"`
   - 优化压缩：使用 svgo

5. **输出文件**
   - 按权重分类输出
   - 收集元数据信息

## 便捷引用方式

提供便捷的引用方式：在引用图标时能通过文件原始命名和规范后的命名引用。

### 图标引用方式

图标支持两种引用方式：

1. **规范命名（kebab-case）**：使用统一转换后的 kebab-case 格式
   - 例如：`four-leaf-clover`、`xcircle-s`

2. **原始命名**：使用文件的原始名称（去除权重后缀后）
   - 例如：如果原始文件名为 `FourLeafClover-regular.svg`，去除权重后缀后为 `FourLeafClover`
   - 可以通过原始名称或转换后的 PascalCase 名称引用

### 查找函数

- `findIcon(name: string)`: 支持通过 kebab-case 名称或原始名称查找
- `findIconByPascalName(pascalName: string)`: 支持通过 PascalCase 名称或原始 PascalCase 名称查找

如果原始文件名与规范后的名称不同，系统会自动创建别名（alias），使得两种命名方式都可以使用。

### 示例

```typescript
import { findIcon, findIconByPascalName } from '@snowui-design-system/resource-core';

// 通过规范名称查找
const icon1 = findIcon('four-leaf-clover');

// 通过原始名称查找（如果原始名称与规范名称不同）
const icon2 = findIcon('FourLeafClover'); // 如果原始文件名为 FourLeafClover-regular.svg

// 通过 PascalCase 名称查找
const icon3 = findIconByPascalName('FourLeafClover');
```

## 发布包

### 发布前准备

1. **处理所有素材**
   ```bash
   npm run process
   ```

2. **更新版本号**
   ```bash
   # 手动编辑 package.json 或使用 npm version
   npm version patch  # 1.0.0 -> 1.0.1
   npm version minor  # 1.0.0 -> 1.1.0
   npm version major  # 1.0.0 -> 2.0.0
   ```

3. **验证生成的文件**
   ```bash
   ls -la src/icons.ts src/assets.ts
   ```

### 发布到 npm

```bash
# 登录 npm（首次发布需要）
npm login

# 发布公开包（scoped package 必须使用 --access public）
npm publish --access public
```

### 验证发布

```bash
# 查看已发布的包
npm view @snowui-design-system/resource-core

# 测试安装
npm install @snowui-design-system/resource-core
```

更多发布详情请参考 [发布指南.md](./发布指南.md)

## 注意事项

1. **原始文件保护**：所有原始文件保存在 `original/` 目录中，不会被修改
2. **文件覆盖**：处理后的文件会覆盖同名文件，请确保原始文件已备份
3. **依赖安装**：首次运行前必须安装 `sharp` 和 `svgo`，否则压缩功能无法使用
4. **命名规范**：所有输出文件统一使用 kebab-case 命名
5. **图标优先级**：如果 icons 和 materials 有重名，引用时优先使用 icons 里的素材
6. **素材放置**：素材可以直接放在 `assets/<类别>/` 目录下，也可以放在 `assets/<类别>/original/` 目录下，脚本会自动发现并处理

## 常见问题

### Q: 为什么 PNG 文件没有被压缩？

A: 请确保已安装 `sharp` 依赖：
```bash
pnpm add -D sharp
```

### Q: 如何添加新的素材类别？

A: 在 `assets/` 目录下创建新文件夹，并在其中创建 `original/` 目录（可选），脚本会自动发现并处理。

### Q: 图标权重如何识别？

A: 通过文件名后缀识别，例如：
- `IconName-regular.svg` → regular 权重
- `IconName-bold.svg` → bold 权重
- `IconName.svg` → 默认 regular 权重

### Q: 如何预览处理结果而不实际写入文件？

A: 使用 `--dry` 参数：
```bash
npx tsx scripts/process-all.ts --dry
```

### Q: 素材可以直接放在类别目录下吗？

A: 可以。素材可以直接放在 `assets/<类别>/` 目录下，也可以放在 `assets/<类别>/original/` 目录下，脚本会自动发现并处理。

## 许可证

MIT
