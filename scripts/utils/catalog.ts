import * as path from "path";
import { promises as fs } from "fs";
import { writeFile } from "./fs";
import { toNameVariants } from "./naming";
import type { IconOutputEntry } from "../process-icons";
import type { MaterialOutputEntry } from "../process-materials";
import type { IconEntry, AssetEntry, IconWeight } from "../../src/types";

/**
 * 图标标签数据
 */
interface IconTagData {
  pascal_name: string;
  tags: string[];
}

const ICON_WEIGHTS: IconWeight[] = ["regular", "thin", "light", "bold", "fill", "duotone"];

/**
 * 加载图标标签数据
 */
async function loadIconTags(baseDir: string): Promise<Map<string, string[]>> {
  const tagsFilePath = path.join(baseDir, "src", "icon-tags.json");
  const tagsMap = new Map<string, string[]>();

  try {
    const tagsData: IconTagData[] = JSON.parse(
      await fs.readFile(tagsFilePath, "utf-8")
    );
    for (const item of tagsData) {
      tagsMap.set(item.pascal_name, item.tags);
    }
    console.log(`📋 [catalog] Loaded ${tagsMap.size} icon tags from icon-tags.json`);
  } catch (error) {
    console.warn(`⚠️  [catalog] Failed to load icon-tags.json: ${error instanceof Error ? error.message : String(error)}`);
  }

  return tagsMap;
}

/**
 * 更新 catalog 文件（icons.ts 和 assets.ts）
 */
export async function updateCatalog(options: {
  icons: IconOutputEntry[];
  materials: MaterialOutputEntry[];
  baseDir?: string;
}): Promise<void> {
  const baseDir = options.baseDir ?? path.join(__dirname, "..", "..");
  const srcDir = path.join(baseDir, "src");

  // 确保 src 目录存在
  await fs.mkdir(srcDir, { recursive: true });

  // 加载图标标签数据
  const tagsMap = await loadIconTags(baseDir);

  // 处理图标数据：按名称分组，收集所有权重
  const iconMap = new Map<string, IconEntry>();
  for (const icon of options.icons) {
    const existing = iconMap.get(icon.kebab_name);
    if (existing) {
      if (!existing.weights.includes(icon.weight)) {
        existing.weights.push(icon.weight);
      }
      // 如果原始名称与 kebab_name 不同，且还没有设置 alias，则设置 alias
      if (icon.original_name !== icon.kebab_name && !existing.alias) {
        const { pascal: originalPascal } = toNameVariants(icon.original_name);
        existing.alias = {
          name: icon.original_name,
          pascal_name: originalPascal,
        };
      }
      // 如果现有条目还没有 tags，尝试添加
      if (!existing.tags || existing.tags.length === 0) {
        const tags = tagsMap.get(existing.pascal_name);
        if (tags && tags.length > 0) {
          existing.tags = tags;
        }
      }
    } else {
      const entry: IconEntry = {
        name: icon.kebab_name,
        pascal_name: icon.pascal_name,
        weights: [icon.weight],
      };
      // 如果原始名称与 kebab_name 不同，则设置 alias
      if (icon.original_name !== icon.kebab_name) {
        const { pascal: originalPascal } = toNameVariants(icon.original_name);
        entry.alias = {
          name: icon.original_name,
          pascal_name: originalPascal,
        };
      }
      // 匹配并添加 tags
      const tags = tagsMap.get(icon.pascal_name);
      if (tags && tags.length > 0) {
        entry.tags = tags;
      }
      iconMap.set(icon.kebab_name, entry);
    }
  }

  await hydrateIconsFromExistingAssets(iconMap, baseDir, tagsMap);

  // 转换为数组并排序
  const iconEntries: IconEntry[] = Array.from(iconMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  for (const entry of iconEntries) {
    entry.weights = sortWeights(entry.weights);
  }

  // 处理素材数据
  const assetEntries: AssetEntry[] = options.materials
    .map((material) => ({
      type: material.type,
      name: material.kebab_name,
      pascal_name: material.pascal_name,
      alias: material.alias,
      files: material.files,
    }))
    .sort((a, b) => {
      const typeCompare = a.type.localeCompare(b.type);
      if (typeCompare !== 0) return typeCompare;
      return a.name.localeCompare(b.name);
    });

  // 生成 icons.ts 文件
  await generateIconsFile(srcDir, iconEntries);

  // 生成 assets.ts 文件
  await generateAssetsFile(srcDir, assetEntries);

  console.log(`📝 [catalog] Updated icons.ts (${iconEntries.length} entries)`);
  console.log(`📝 [catalog] Updated assets.ts (${assetEntries.length} entries)`);
}

function sortWeights(weights: IconWeight[]): IconWeight[] {
  const order = new Map(ICON_WEIGHTS.map((w, idx) => [w, idx]));
  const unique = Array.from(new Set(weights));
  return unique.sort((a, b) => {
    const ai = order.get(a) ?? ICON_WEIGHTS.length;
    const bi = order.get(b) ?? ICON_WEIGHTS.length;
    return ai - bi;
  });
}

async function hydrateIconsFromExistingAssets(
  iconMap: Map<string, IconEntry>,
  baseDir: string,
  tagsMap: Map<string, string[]>
): Promise<void> {
  const iconsDir = path.join(baseDir, "assets", "icons");

  for (const weight of ICON_WEIGHTS) {
    const weightDir = path.join(iconsDir, weight);
    let files: string[];
    try {
      files = await fs.readdir(weightDir);
    } catch {
      continue;
    }

    for (const file of files) {
      if (!file.endsWith(".svg")) continue;
      const kebab = file
        .replace(new RegExp(`-${weight}\\.svg$`, "i"), "")
        .replace(/\.svg$/i, "");
      if (!kebab) continue;

      const existing = iconMap.get(kebab);
      if (existing) {
        if (!existing.weights.includes(weight)) {
          existing.weights.push(weight);
        }
        // 如果现有条目还没有 tags，尝试添加
        if (!existing.tags || existing.tags.length === 0) {
          const tags = tagsMap.get(existing.pascal_name);
          if (tags && tags.length > 0) {
            existing.tags = tags;
          }
        }
      } else {
        const { pascal } = toNameVariants(kebab);
        const entry: IconEntry = {
          name: kebab,
          pascal_name: pascal,
          weights: [weight],
        };
        // 匹配并添加 tags
        const tags = tagsMap.get(pascal);
        if (tags && tags.length > 0) {
          entry.tags = tags;
        }
        iconMap.set(kebab, entry);
      }
    }
  }
}

/**
 * 生成 icons.ts 文件
 */
async function generateIconsFile(srcDir: string, icons: IconEntry[]): Promise<void> {
  const filePath = path.join(srcDir, "icons.ts");
  
  let content = `import type { IconEntry } from "./types";

/**
 * 图标元数据列表
 * 
 * 此文件由 scripts/process-all.ts 自动生成，请勿手动编辑
 */
export const icons = <const>[
`;

  for (const icon of icons) {
    const weightsStr = icon.weights.map((w) => `"${w}"`).join(", ");
    const aliasStr = icon.alias
      ? `\n    alias: { name: "${icon.alias.name}", pascal_name: "${icon.alias.pascal_name}" },`
      : "";
    const tagsStr = icon.tags && icon.tags.length > 0
      ? `\n    tags: [${icon.tags.map((t) => `"${t.replace(/"/g, '\\"')}"`).join(", ")}],`
      : "";

    content += `  {
    name: "${icon.name}",
    pascal_name: "${icon.pascal_name}",${aliasStr}${tagsStr}
    weights: [${weightsStr}],
  },
`;
  }

  content += `] satisfies readonly IconEntry[];

/**
 * 根据名称查找图标
 */
export function findIcon(name: string): IconEntry | undefined {
  return icons.find(
    (icon) => icon.name === name || icon.alias?.name === name
  );
}

/**
 * 根据 PascalCase 名称查找图标
 */
export function findIconByPascalName(pascalName: string): IconEntry | undefined {
  return icons.find(
    (icon) => icon.pascal_name === pascalName || icon.alias?.pascal_name === pascalName
  );
}

/**
 * 获取所有图标名称
 */
export function getAllIconNames(): string[] {
  return icons.map((icon) => icon.name);
}
`;

  await writeFile(filePath, content);
}

/**
 * 生成 assets.ts 文件
 */
async function generateAssetsFile(srcDir: string, assets: AssetEntry[]): Promise<void> {
  const filePath = path.join(srcDir, "assets.ts");
  
  let content = `import type { AssetEntry } from "./types";

/**
 * 素材元数据列表
 * 
 * 此文件由 scripts/process-all.ts 自动生成，请勿手动编辑
 */
export const assets = <const>[
`;

  for (const asset of assets) {
    const aliasStr = asset.alias
      ? `\n    alias: { name: "${asset.alias.name}", pascal_name: "${asset.alias.pascal_name}" },`
      : "";
    const filesStr = asset.files
      .map((f) => `      { format: "${f.format}", path: "${f.path}" }`)
      .join(",\n");

    content += `  {
    type: "${asset.type}",
    name: "${asset.name}",
    pascal_name: "${asset.pascal_name}",${aliasStr}
    files: [
${filesStr}
    ],
  },
`;
  }

  content += `] satisfies readonly AssetEntry[];

/**
 * 根据类型和名称查找素材
 */
export function findAsset(type: string, name: string): AssetEntry | undefined {
  return assets.find(
    (asset) => asset.type === type && (asset.name === name || asset.alias?.name === name)
  );
}

/**
 * 根据类型获取所有素材
 */
export function getAssetsByType(type: string): AssetEntry[] {
  return assets.filter((asset) => asset.type === type);
}

/**
 * 获取所有素材类型
 */
export function getAllAssetTypes(): string[] {
  return Array.from(new Set(assets.map((asset) => asset.type)));
}
`;

  await writeFile(filePath, content);
}

