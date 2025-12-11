import * as path from "path";
import { promises as fs } from "fs";
import { listAssets, writeFile, ensureDir, resolvePath } from "./utils/fs";
import { toNameVariants } from "./utils/naming";
import { processImageFile, isBitmapFile, resizeImage, resizeImageByWidth } from "./utils/image";

type MaterialGroup = string;

export interface ProcessMaterialsOptions {
  /** 生成输出目录，默认 resource-base/assets */
  baseAssetsDir?: string;
  /** 原始素材目录，默认 resource-base/raw-assets（必需） */
  rawAssetsDir?: string;
  /** 要处理的素材分组 */
  groups?: MaterialGroup[];
  /** 需要排除的分组（默认排除 icons） */
  excludeGroups?: string[];
  /** 是否仅打印日志而不写入文件 */
  dryRun?: boolean;
  /** 需要生成多种尺寸的素材类型（如 ['avatars']），正方形尺寸（仅位图） */
  multiSizeGroups?: string[];
  /** 要生成的尺寸列表（如 [64, 128, 256, 512]），正方形尺寸 */
  sizes?: number[];
  /** 需要生成多种宽度的素材类型（如 ['illustrations']），宽度固定，高度自适应（仅位图） */
  multiWidthGroups?: string[];
  /** 要生成的宽度列表（如 [80, 128, 256, 512]），宽度固定，高度自适应 */
  widths?: number[];
  /** 不同素材类型的宽度配置（覆盖全局 widths） */
  widthConfigs?: Record<string, number[]>;
}

export interface MaterialOutputEntry {
  type: MaterialGroup;
  name: string;
  kebab_name: string;
  pascal_name: string;
  alias?: { name: string; pascal_name: string };
  files: { format: string; path: string; size?: number }[];
}

const ALLOWED_EXTS = [".svg", ".png", ".jpg", ".jpeg", ".webp"];

export async function processMaterials(options: ProcessMaterialsOptions = {}): Promise<MaterialOutputEntry[]> {
  const baseAssetsDir = options.baseAssetsDir ?? path.join(__dirname, "..", "assets");
  const rawAssetsDir = options.rawAssetsDir ?? path.join(__dirname, "..", "raw-assets");

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
    const originalDir = path.join(rawAssetsDir, group);
    const hasOriginal = await fs.access(originalDir).then(() => true).catch(() => false);
    if (!hasOriginal) {
      console.warn(`[materials] skip: original directory not found at ${originalDir}`);
      continue;
    }

    {
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
          
          // 如果该分组需要生成多种尺寸（正方形）
          const multiSizeGroups = (options.multiSizeGroups ?? []).map(g => g.toLowerCase());
          const sizes = options.sizes ?? [];
          
          if (multiSizeGroups.includes(group.toLowerCase())) {
            for (const size of sizes) {
              const sizeOutRel = `${group}/${variants.kebab}-${size}${file.ext}`;
              const sizeOutAbs = path.join(baseAssetsDir, sizeOutRel);
              await resizeImage(file.path, size, size, sizeOutAbs);
              
              // 也添加到元数据中
              upsertMaterialEntry(resultsMap, group, variants, file.baseName, {
                format: file.ext.slice(1),
                path: sizeOutRel,
                size, // 添加尺寸信息
              });
            }
          }
          
          // 如果该分组需要生成多种宽度（宽度固定，高度自适应）
          // 注意：只处理位图文件，SVG等非位图不进行尺寸处理
          const multiWidthGroups = (options.multiWidthGroups ?? []).map(g => g.toLowerCase());
          
          if (multiWidthGroups.includes(group.toLowerCase())) {
            // 优先使用分组特定的宽度配置，否则使用全局配置
            const widths = options.widthConfigs?.[group.toLowerCase()] ?? options.widths ?? [];
            
            for (const width of widths) {
              const widthOutRel = `${group}/${variants.kebab}-${width}${file.ext}`;
              const widthOutAbs = path.join(baseAssetsDir, widthOutRel);
              await resizeImageByWidth(file.path, width, widthOutAbs);
              
              // 也添加到元数据中
              upsertMaterialEntry(resultsMap, group, variants, file.baseName, {
                format: file.ext.slice(1),
                path: widthOutRel,
                size: width, // 使用 size 字段存储宽度
              });
            }
          }
        } else {
          const content = await fs.readFile(file.path);
          await writeFile(outAbs, content);
        }
      } else {
        if (isBitmapFile(file.path)) {
          console.log(`   [dry-run] Would compress: ${file.path} → ${outRel}`);
          const multiSizeGroups = (options.multiSizeGroups ?? []).map(g => g.toLowerCase());
          const sizes = options.sizes ?? [];
          if (multiSizeGroups.includes(group.toLowerCase())) {
            for (const size of sizes) {
              console.log(`   [dry-run] Would resize to ${size}x${size}: ${file.path} → ${group}/${variants.kebab}-${size}${file.ext}`);
            }
          }
          const multiWidthGroups = (options.multiWidthGroups ?? []).map(g => g.toLowerCase());
          if (multiWidthGroups.includes(group.toLowerCase())) {
            const widths = options.widthConfigs?.[group.toLowerCase()] ?? options.widths ?? [];
            for (const width of widths) {
              console.log(`   [dry-run] Would resize to width ${width} (height auto): ${file.path} → ${group}/${variants.kebab}-${width}${file.ext}`);
            }
          }
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
  file: { format: string; path: string; size?: number }
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

