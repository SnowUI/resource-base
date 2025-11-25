# @snowui-design-system/resource-base

<div align="center">

**Base resource package for SnowUI Design System - Asset processing and management**

[English](#english) | [中文](#中文)

</div>

---

## English

`@snowui-design-system/resource-base` is the base resource package for SnowUI Design System, responsible for unified management and processing of all design assets (icons, avatars, backgrounds, cursors, etc.).

### ✨ Key Features

- **Batch Asset Processing**: Automatically scan, rename, compress, and optimize various asset files
- **Multi-weight Icons**: Support for regular, thin, light, bold, fill, and duotone weights with color normalization
- **Smart Asset Sizing**: Automatic multi-size generation for bitmaps
  - **Avatars**: Square sizes 16×16, 20×20, 24×24, 28×28, 32×32, 40×40, 48×48, 56×56, 64×64, 80×80, 128×128, 256×256, 512×512 (default: 32×32)
  - **Backgrounds**: Fixed widths 320, 640, 1024, 1920 (default: 1024px, height auto)
  - **Images**: Fixed widths 160, 320, 640, 1024 (default: 320px, height auto)
  - **Illustrations**: Fixed widths 160, 320, 640, 1024 (default: 320px, height auto)
- **Automatic Size Matching**: Components automatically select the closest available size when a non-standard size is requested
- **Asset Categorization**: Organized by type (avatars, backgrounds, cursors, emoji, icons, illustrations, images, logos)
- **File Standardization**: Unified naming convention (kebab-case)
- **Compression & Optimization**: Automatic compression for bitmaps (PNG, JPG, WebP) and SVG files
- **Metadata Generation**: Automatic generation of icon and asset metadata files

### 🚀 Quick Start

#### Installation

```bash
npm install @snowui-design-system/resource-base
# or
pnpm add @snowui-design-system/resource-base
```

#### Usage

```typescript
import { icons, assets, findIcon, findAsset } from '@snowui-design-system/resource-base';

// Get all icons
console.log(icons);

// Find icon
const icon = findIcon('four-leaf-clover');
console.log(icon?.weights); // ['regular', 'thin', 'light', 'bold', 'fill', 'duotone']

// Find asset
const asset = findAsset('avatar-byewind');
console.log(asset?.type); // 'avatars'
```

#### Direct Asset Import

```typescript
// Import icon SVG
import iconSvg from '@snowui-design-system/resource-base/assets/icons/regular/four-leaf-clover-regular.svg';

// Import assets
import avatar from '@snowui-design-system/resource-base/assets/avatars/avatar-byewind.png';
import background from '@snowui-design-system/resource-base/assets/backgrounds/gradient-01.jpg';
```

### 🛠️ Processing Assets

#### Process All Assets

```bash
cd resource-base
npm run process
```

This will:
- Process materials (avatars, backgrounds, etc.) with compression and multi-size generation
- Process icons with color normalization and optimization
- Generate metadata files (`src/icons.ts`, `src/assets.ts`)

#### Process Materials Only

```bash
npm run process:materials
```

#### Process Icons Only

```bash
npm run process:icons
```

#### Dry Run Mode

```bash
npx tsx scripts/process-all.ts --dry
```

### 📊 Asset Size Configuration

#### Avatars (Square Sizes)

Generated sizes: 16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 128, 256, 512  
Default: 32×32

**Note**: Only bitmap files (PNG, JPG, WebP) are processed. SVG files are copied as-is.

#### Backgrounds (Fixed Width, Auto Height)

Generated widths: 320, 640, 1024, 1920  
Default: 1024px

**Note**: Only bitmap files are processed. SVG files are copied as-is.

#### Images (Fixed Width, Auto Height)

Generated widths: 160, 320, 640, 1024  
Default: 320px

**Note**: Only bitmap files are processed. SVG files are copied as-is.

#### Illustrations (Fixed Width, Auto Height)

Generated widths: 160, 320, 640, 1024  
Default: 320px

**Note**: Only bitmap files are processed. SVG files are copied as-is.

### 🔗 Related Projects

- **[resource-react](https://github.com/snowui/resource-react)** - React components package
- **[example](https://github.com/snowui/example)** - Example website
- **[Live Demo](https://snowui.github.io/example)** - View the example website

### 📚 Documentation

- [Resource Package Documentation](../README.md)
- [React Package Documentation](../react/README.md)

### 📄 License

MIT

---

## 中文

`@snowui-design-system/resource-base` 是 SnowUI 设计资基础包，负责统一管理和处理所有设计素材（图标、头像、背景、光标等）。

### ✨ 核心特性

- **批量素材处理**：自动扫描、重命名、压缩和优化各类素材文件
- **多权重图标**：支持 regular、thin、light、bold、fill 和 duotone 权重，并进行颜色标准化处理
- **智能素材尺寸**：位图自动生成多种尺寸
  - **头像**：正方形尺寸 16×16, 20×20, 24×24, 28×28, 32×32, 40×40, 48×48, 56×56, 64×64, 80×80, 128×128, 256×256, 512×512（默认：32×32）
  - **背景**：固定宽度 320, 640, 1024, 1920（默认：1024px，高度自适应）
  - **图片**：固定宽度 160, 320, 640, 1024（默认：320px，高度自适应）
  - **插画**：固定宽度 160, 320, 640, 1024（默认：320px，高度自适应）
- **自动尺寸匹配**：当请求非标准尺寸时，组件自动选择最接近的可用尺寸
- **素材分类**：按类型组织素材（avatars、backgrounds、cursors、emoji、icons、illustrations、images、logos）
- **文件标准化**：统一文件命名规范（kebab-case）
- **压缩优化**：自动压缩位图（PNG、JPG、WebP）和 SVG 文件
- **元数据生成**：自动生成图标和素材的元数据文件

### 🚀 快速开始

#### 安装

```bash
npm install @snowui-design-system/resource-base
# 或
pnpm add @snowui-design-system/resource-base
```

#### 使用

```typescript
import { icons, assets, findIcon, findAsset } from '@snowui-design-system/resource-base';

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
import iconSvg from '@snowui-design-system/resource-base/assets/icons/regular/four-leaf-clover-regular.svg';

// 导入素材
import avatar from '@snowui-design-system/resource-base/assets/avatars/avatar-byewind.png';
import background from '@snowui-design-system/resource-base/assets/backgrounds/gradient-01.jpg';
```

### 🛠️ 处理素材

#### 处理所有素材

```bash
cd resource-base
npm run process
```

这将：
- 处理素材（头像、背景等），进行压缩和多尺寸生成
- 处理图标，进行颜色标准化和优化
- 生成元数据文件（`src/icons.ts`、`src/assets.ts`）

#### 仅处理素材

```bash
npm run process:materials
```

#### 仅处理图标

```bash
npm run process:icons
```

#### 预览模式

```bash
npx tsx scripts/process-all.ts --dry
```

### 📊 素材尺寸配置

#### 头像（正方形尺寸）

生成的尺寸：16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 128, 256, 512  
默认：32×32

**注意**：只处理位图文件（PNG、JPG、WebP）。SVG 文件保持原样。

#### 背景（固定宽度，高度自适应）

生成的宽度：320, 640, 1024, 1920  
默认：1024px

**注意**：只处理位图文件。SVG 文件保持原样。

#### 图片（固定宽度，高度自适应）

生成的宽度：160, 320, 640, 1024  
默认：320px

**注意**：只处理位图文件。SVG 文件保持原样。

#### 插画（固定宽度，高度自适应）

生成的宽度：160, 320, 640, 1024  
默认：320px

**注意**：只处理位图文件。SVG 文件保持原样。

### 🔗 相关项目

- **[resource-react](https://github.com/snowui/resource-react)** - React 组件包
- **[example](https://github.com/snowui/example)** - 示例网站
- **[在线演示](https://snowui.github.io/example)** - 查看示例网站

### 📚 文档

- [资源包文档](../README.md)
- [React 包文档](../react/README.md)

### 📄 许可证

MIT
