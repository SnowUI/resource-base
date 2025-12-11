# @snowui-design-system/resource-base

<div align="center">

**Base resource package for SnowUI Design System - Asset processing and management**

**Repository**: [https://github.com/SnowUI/resource-base](https://github.com/SnowUI/resource-base)

[English](#english) | [中文](#中文)

</div>

---

## English

`@snowui-design-system/resource-base` is the base resource package for SnowUI Design System, responsible for processing design assets and publishing them as an npm package. It reads raw assets from the `raw-assets` folder, processes them according to predefined rules, and outputs standardized assets with metadata.

### ✨ Key Features

- **Raw Asset Processing**: Reads original assets from `raw-assets` folder and processes them into standardized formats
- **File Naming Standardization**: Automatically renames all assets to kebab-case format (e.g., `four-leaf-clover-duotone.svg`)
- **Icon Weight Classification**: Icons are categorized by suffix (`-regular`, `-thin`, `-light`, `-bold`, `-fill`, `-duotone`). Icons without a suffix default to `regular` weight
  - **Import Path**: `@snowui-design-system/resource-base/assets/icons/{weight}/{name}-{weight}.svg`
- **Smart Color Processing**: 
  - Black icons (`#000000`) are converted to `currentColor` for easy CSS styling
  - Colored icons (containing colors other than black/white) are preserved as original SVG files
- **Bitmap Compression & Multi-Size Generation**: Automatically compresses bitmaps and generates multiple sizes
  - **Avatars**: Square sizes 16, 20, 24, 28, 32, 40, 48, 56, 60, 64, 72, 80, 84, 96, 120, 128, 144, 168, 192, 240, 256, 384, 512, 768, 1536 (includes 1x and 3x variants)
  - **Backgrounds**: Fixed widths 320, 640, 1024, 1920 (default: 1024px, height auto)
  - **Images**: Fixed widths 160, 320, 640, 1024 (default: 320px, height auto)
  - **Illustrations**: Fixed widths 160, 320, 640, 1024 (default: 320px, height auto)
- **3x Retina Support**: Size definitions correspond to 3x actual image sizes. Components automatically select the closest available size (e.g., requesting `size={31}` will match `96` which is `31 × 3`)
- **Automatic Metadata Generation**: Automatically generates icon and asset metadata files (`src/icons.ts`, `src/assets.ts`)
- **Asset Categorization**: Organized by type (avatars, backgrounds, cursors, emoji, icons, illustrations, images, logos)

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

#### Using Svelte Components

For Svelte projects, use `@snowui-design-system/resource-svelte` package which provides ready-to-use components:

```svelte
<script>
  import { FourLeafClover, Stars, Avatar3d01 } from '@snowui-design-system/resource-svelte';
</script>

<!-- Icon with different weights -->
<FourLeafClover size={32} weight="duotone" />
<FourLeafClover size={32} weight="regular" />
<FourLeafClover size={32} weight="fill" />

<!-- Avatar with custom size -->
<Avatar3d01 size={64} />

<!-- Icon with custom class for styling -->
<Stars size={24} weight="duotone" class="text-blue" />
```

**Note**: Install `@snowui-design-system/resource-svelte` separately for Svelte component support.

### 🛠️ Processing Assets

#### Process All Assets

```bash
cd resource-base
npm run process
```

This will:
- Read raw assets from `raw-assets` folder
- Process materials (avatars, backgrounds, etc.) with compression and multi-size generation
- Process icons: convert black colors to `currentColor`, preserve colored icons as original files
- Rename all assets to kebab-case format
- Categorize icons by weight suffix (defaults to `regular` if no suffix)
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

Generated sizes: 16, 20, 24, 28, 32, 40, 48, 56, 60, 64, 72, 80, 84, 96, 120, 128, 144, 168, 192, 240, 256, 384, 512, 768, 1536  
Default: 32×32

**Note**: 
- Includes both 1x and 3x variants (e.g., 16, 48, 32, 96, etc.)
- Size definitions correspond to 3x actual image sizes for retina displays
- Components automatically select the closest available size (e.g., `size={31}` matches `96` which is `31 × 3`)
- Only bitmap files (PNG, JPG, WebP) are processed. SVG files are copied as-is.

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
- **[Live Demo](https://snowui.github.io/resource-react-demo/)** - View the example website

### 📚 Documentation

- [Resource Package Documentation](../README.md)
- [React Package Documentation](../react/README.md)

### 📄 License

MIT

---

## 中文

`@snowui-design-system/resource-base` 是 SnowUI 设计系统的基础资源包，用于处理设计素材并发布为 npm 包。它从 `raw-assets` 文件夹读取原始素材，按照预定义规则进行处理，并输出标准化的素材和元数据。

### ✨ 核心特性

- **原始素材处理**：从 `raw-assets` 文件夹读取原始素材，处理为标准格式
- **文件命名标准化**：自动将所有素材重命名为 kebab-case 格式（如 `four-leaf-clover-duotone.svg`）
- **图标权重分类**：图标根据后缀进行分类（`-regular`、`-thin`、`-light`、`-bold`、`-fill`、`-duotone`）。无后缀的图标默认为 `regular` 权重
  - **引用方式**：`@snowui-design-system/resource-base/assets/icons/{weight}/{name}-{weight}.svg`
- **智能颜色处理**：
  - 黑色图标（`#000000`）转换为 `currentColor`，方便通过 CSS 添加颜色样式
  - 有色图标（包含除黑白色外的其他颜色）保留为原始 SVG 文件
- **位图压缩与多尺寸生成**：自动压缩位图并生成多种尺寸
  - **头像**：正方形尺寸 16, 20, 24, 28, 32, 40, 48, 56, 60, 64, 72, 80, 84, 96, 120, 128, 144, 168, 192, 240, 256, 384, 512, 768, 1536（包含 1x 和 3x 变体）
  - **背景**：固定宽度 320, 640, 1024, 1920（默认：1024px，高度自适应）
  - **图片**：固定宽度 160, 320, 640, 1024（默认：320px，高度自适应）
  - **插画**：固定宽度 160, 320, 640, 1024（默认：320px，高度自适应）
- **3x 视网膜支持**：尺寸定义对应 3x 实际大小的图片。组件自动选择最接近的可用尺寸（例如，请求 `size={31}` 会匹配 `96`，即 `31 × 3`）
- **自动元数据生成**：自动生成图标和素材的元数据文件（`src/icons.ts`、`src/assets.ts`）
- **素材分类**：按类型组织素材（avatars、backgrounds、cursors、emoji、icons、illustrations、images、logos）

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

#### 使用 Svelte 组件

对于 Svelte 项目，使用 `@snowui-design-system/resource-svelte` 包，它提供了开箱即用的组件：

```svelte
<script>
  import { FourLeafClover, Stars, Avatar3d01 } from '@snowui-design-system/resource-svelte';
</script>

<!-- 不同权重的图标 -->
<FourLeafClover size={32} weight="duotone" />
<FourLeafClover size={32} weight="regular" />
<FourLeafClover size={32} weight="fill" />

<!-- 自定义尺寸的头像 -->
<Avatar3d01 size={64} />

<!-- 带自定义类名的图标，用于样式控制 -->
<Stars size={24} weight="duotone" class="text-blue" />
```

**注意**：需要单独安装 `@snowui-design-system/resource-svelte` 包以使用 Svelte 组件。

### 🛠️ 处理素材

#### 处理所有素材

```bash
cd resource-base
npm run process
```

这将：
- 从 `raw-assets` 文件夹读取原始素材
- 处理素材（头像、背景等），进行压缩和多尺寸生成
- 处理图标：将黑色转换为 `currentColor`，保留有色图标为原始文件
- 将所有素材重命名为 kebab-case 格式
- 根据权重后缀对图标进行分类（无后缀默认为 `regular`）
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

生成的尺寸：16, 20, 24, 28, 32, 40, 48, 56, 60, 64, 72, 80, 84, 96, 120, 128, 144, 168, 192, 240, 256, 384, 512, 768, 1536  
默认：32×32

**注意**：
- 包含 1x 和 3x 变体（例如：16, 48, 32, 96 等）
- 尺寸定义对应 3x 实际大小的图片，用于视网膜显示屏
- 组件自动选择最接近的可用尺寸（例如：`size={31}` 会匹配 `96`，即 `31 × 3`）
- 只处理位图文件（PNG、JPG、WebP）。SVG 文件保持原样。

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
- **[在线演示](https://snowui.github.io/resource-react-demo/)** - 查看示例网站

### 📚 文档

- [资源包文档](../README.md)
- [React 包文档](../react/README.md)

### 📄 许可证

MIT
