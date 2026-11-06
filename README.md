# SnowUI Resource Base

The base package processes SnowUI assets and provides icon collection metadata and resolution.

## Install

```sh
pnpm add @snowui-design-system/resource-base
```

## Use

```ts
import { resolveIcon } from '@snowui-design-system/resource-base';

const icon = resolveIcon('arrow-line-right', {
  collection: 'snowui',
  weight: 'regular',
});
```

Assets are stored in `raw-assets/` and processed into `assets/`. The resolver and collection metadata live in `src/`.

## Develop

```sh
pnpm install
pnpm build
```
