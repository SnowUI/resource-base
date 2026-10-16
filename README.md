# @snowui-design-system/resource-base

SnowUI 资源基础包，负责处理原始素材、生成公开资源元数据，并提供多图标库切换的核心解析能力。

仓库：[SnowUI/resource-base](https://github.com/SnowUI/resource-base)

## 核心能力

- 多图标库并存：`snowui`、`phosphor`、`special`，并预留 `material-symbols`、`lucide`、`heroicons`、`mdi` 等 Iconify 在线库。
- 稳定使用名：业务侧使用 `usageName`，例如 `arrow-line-right`，不直接绑定某个库的真实文件名。
- 跨库映射：同一个 `usageName` 可以映射到不同 collection 的 `iconName`。
- 权重保留：支持 `regular`、`thin`、`light`、`bold`、`fill`、`duotone`，缺失权重时按相似度降级并记录 `degraded`。
- Iconify 同步：构建时同步在线图标库名称索引，在线 SVG 解析由 `resource-base` 统一封装。
- 自适应 Logo：单色黑色与视觉近黑色使用 `currentColor`，供框架组件继承页面文字颜色并适配明暗主题。
- 切换检查：`check:switch` 可扫描项目使用并模拟切换到目标图标库，输出 `matched / degraded / fallback / missing / preserved` 报告。

## 目录结构

```txt
resource-base/
├── raw-assets/
│   ├── icons/
│   │   ├── snowui/
│   │   ├── phosphor/
│   │   └── special/
│   ├── logos/
│   └── icon-mappings.source.json
├── assets/
│   ├── icons/
│       ├── snowui/{regular,thin,light,bold,fill,duotone}/
│       ├── phosphor/{regular,thin,light,bold,fill,duotone}/
│       └── special/
│   └── logos/
├── src/
│   ├── collections.ts
│   ├── icons.ts
│   ├── icon-mappings.ts
│   ├── iconify-collections.ts
│   ├── icon-resolver.ts
│   └── weight-similarity.ts
└── scripts/
    ├── process-all.ts
    ├── sync-iconify.ts
    ├── build-mappings.ts
    ├── scan-usage.ts
    ├── check-switch.ts
    └── test-regression.ts
```

## 安装

```bash
pnpm add @snowui-design-system/resource-base
```

## 使用

```ts
import {
  resolveIcon,
  resolveIconAsync,
  listResolutions,
  collections,
} from "@snowui-design-system/resource-base";

resolveIcon("arrow-line-right", {
  collection: "snowui",
  weight: "regular",
});

resolveIcon("arrow-line-right", {
  collection: "phosphor",
  weight: "regular",
});

await resolveIconAsync("home", {
  collection: "material-symbols",
  allowRemote: true,
});

listResolutions("arrow-line-right");
collections.map((item) => item.id);
```

## 命名约定

| 字段 | 说明 |
| --- | --- |
| `collection` | 图标库，例如 `snowui`、`phosphor`、`material-symbols` |
| `usageName` | 页面稳定使用名，必须是语义化 kebab-case |
| `iconName` | 某个 collection 内真实图标名 |
| `sourceName` | 原始素材名，用于追踪来源 |
| `weight` | 图标权重 |

新增图标素材时必须登记 `collection`、`sourceName`、`iconName`、`usageName`、`weights`；第三方素材还必须记录授权信息。

## 构建

```bash
pnpm process
pnpm build:mappings
pnpm test:regression
pnpm build
```

`pnpm build` 会依次处理素材、使用仓库中已审核的 Iconify 名称索引、生成映射并运行回归测试。`prepublishOnly` 也会执行完整构建。更新在线 Iconify 名称时，单独运行 `pnpm sync:iconify`，审核并提交生成的索引；如果任一图标库来源不可用，同步会报错并保留原索引。构建不依赖实时 Iconify API。

## 切换检查

```bash
pnpm check:switch --to phosphor --scope /Users/yuan/Project/snowui/resource-svelte-demo
pnpm check:switch --to material-symbols --scope /Users/yuan/Project/snowui/resource-react-demo
```

`special` collection 默认保留，不参与整体替换。

## 发布与同步

本目录对应 GitHub 仓库：

```txt
https://github.com/SnowUI/resource-base
```

统一脚本：

```bash
/Users/yuan/Project/snowui/scripts/publish-and-sync.sh --target resource-base --version patch --message "chore: release resource-base" --yes
```

依赖顺序中，`resource-base` 必须先于 `resource-svelte` 和 `resource-react` 发布。
