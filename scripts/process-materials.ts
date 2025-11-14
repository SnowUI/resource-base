import * as path from "path";
import { promises as fs } from "fs";
import { listAssets, writeFile, ensureDir, resolvePath } from "./utils/fs";
import { toNameVariants } from "./utils/naming";
import { processImageFile, isBitmapFile } from "./utils/image";

type MaterialGroup = string;

export interface ProcessMaterialsOptions {
  /** 资源根目录，默认 resource/core/assets */
  baseAssetsDir?: string;
  /** 要处理的素材分组 */
  groups?: MaterialGroup[];
  /** 需要排除的分组（默认排除 icons） */
  excludeGroups?: string[];
  /** 是否仅打印日志而不写入文件 */
  dryRun?: boolean;
}

export interface MaterialOutputEntry {
  type: MaterialGroup;
  name: string;
  kebab_name: string;
  pascal_name: string;
  alias?: { name: string; pascal_name: string };
  files: { format: string; path: string }[];
}

const ALLOWED_EXTS = [".svg", ".png", ".jpg", ".jpeg", ".webp"];

export async function processMaterials(options: ProcessMaterialsOptions = {}): Promise<MaterialOutputEntry[]> {
  // 默认以脚本所在目录为基准，定位到 ../assets
  const baseAssetsDir = options.baseAssetsDir ?? path.join(__dirname, "..", "assets");

  // 自动发现 assets 下的一级目录作为分组（如 avatars/backgrounds/cursors/emoji/icons/...）
  const groups: MaterialGroup[] = options.groups ?? (await (async () => {
    try {
      const entries = await fs.readdir(baseAssetsDir, { withFileTypes: true });
      return entries.filter((e: any) => e.isDirectory()).map((e: any) => e.name);
    } catch {
      return [] as string[];
    }
  })());
  const resultsMap = new Map<string, MaterialOutputEntry>();

  const exclude = new Set((options.excludeGroups ?? ["icons"]).map((g) => g.toLowerCase()));

  for (const group of groups) {
    if (exclude.has(String(group).toLowerCase())) continue;
    const originalDir = path.join(baseAssetsDir, group, "original");
    const hasOriginal = await fs.access(originalDir).then(() => true).catch(() => false);

    if (hasOriginal) {
      const files = await listAssets(originalDir, ALLOWED_EXTS, false);

    for (const file of files) {
      const variants = toNameVariants(file.baseName);
      const outRel = `${group}/${variants.kebab}${file.ext}`;
      const outAbs = path.join(baseAssetsDir, outRel);

      if (!options.dryRun) {
        await ensureDir(path.dirname(outAbs));
        if (isBitmapFile(file.path)) {
          const compressedBuffer = await processImageFile(file.path);
          await writeFile(outAbs, compressedBuffer);
        } else {
          const content = await fs.readFile(file.path);
          await writeFile(outAbs, content);
        }
      } else {
        if (isBitmapFile(file.path)) {
          console.log(`   [dry-run] Would compress: ${file.path} → ${outRel}`);
        }
      }

        upsertMaterialEntry(resultsMap, group, variants, file.baseName, {
          format: file.ext.slice(1),
          path: outRel,
        });
      }
    }

    await hydrateGroupFromBase(resultsMap, baseAssetsDir, group);
  }

  return Array.from(resultsMap.values()).sort((a, b) => {
    if (a.type === b.type) {
      return a.kebab_name.localeCompare(b.kebab_name);
    }
    return a.type.localeCompare(b.type);
  });
}

// 允许直接以脚本运行：npx tsx scripts/process-materials.ts [--dry]
if (require.main === module) {
  (async () => {
    const dryRun = process.argv.includes("--dry");
    const outputs = await processMaterials({ dryRun });
    console.log(`Processed materials: ${outputs.length}`);
    // 打印前 10 条示例
    for (const entry of outputs.slice(0, 10)) {
      console.log(`${entry.type} -> ${entry.kebab_name}:`, entry.files.map((f) => f.path));
    }
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

function getMaterialKey(type: string, kebab: string): string {
  return `${type}::${kebab}`;
}

function upsertMaterialEntry(
  map: Map<string, MaterialOutputEntry>,
  type: string,
  variants: ReturnType<typeof toNameVariants>,
  originalName: string | undefined,
  file: { format: string; path: string }
): void {
  const key = getMaterialKey(type, variants.kebab);
  const existing = map.get(key);

  if (existing) {
    if (!existing.files.some((f) => f.path === file.path)) {
      existing.files.push(file);
    }
    if (!existing.alias && variants.alias) {
      existing.alias = variants.alias;
    }
  } else {
    map.set(key, {
      type,
      name: originalName ?? variants.original,
      kebab_name: variants.kebab,
      pascal_name: variants.pascal,
      alias: variants.alias,
      files: [file],
    });
  }
}

async function hydrateGroupFromBase(
  map: Map<string, MaterialOutputEntry>,
  baseAssetsDir: string,
  group: string
): Promise<void> {
  const groupDir = path.join(baseAssetsDir, group);
  let entries: string[];
  try {
    entries = await fs.readdir(groupDir);
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry.startsWith(".")) continue;
    if (entry.toLowerCase() === "original") continue;
    const full = path.join(groupDir, entry);
    const stat = await fs.stat(full).catch(() => null);
    if (!stat || !stat.isFile()) continue;

    const ext = path.extname(entry).toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) continue;

    const baseName = entry.replace(/\.[^.]+$/, "");
    const variants = toNameVariants(baseName);
    const relPath = path.join(group, entry).replace(/\\/g, "/");

    upsertMaterialEntry(map, group, variants, baseName, {
      format: ext.slice(1),
      path: relPath,
    });
  }
}

