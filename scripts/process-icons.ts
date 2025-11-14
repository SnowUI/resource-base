import * as path from "path";
import { promises as fs } from "fs";
import { listAssets, writeFile } from "./utils/fs";
import { toNameVariants } from "./utils/naming";
import { processSvgFile } from "./utils/svg";

type IconWeight = "regular" | "thin" | "light" | "bold" | "fill" | "duotone";
const WEIGHTS: IconWeight[] = ["regular", "thin", "light", "bold", "fill", "duotone"];

function detectWeightFromBase(baseName: string): IconWeight {
  const m = baseName.match(/-(regular|thin|light|bold|fill|duotone)$/i);
  if (!m) return "regular";
  return m[1].toLowerCase() as IconWeight;
}

function stripWeightSuffix(baseName: string): string {
  return baseName.replace(/-(regular|thin|light|bold|fill|duotone)$/i, "");
}

export interface ProcessIconsOptions {
  /** 资源根目录，默认 scripts 同级的 ../assets */
  baseAssetsDir?: string;
  /** 是否仅打印日志 */
  dryRun?: boolean;
}

export interface IconOutputEntry {
  kebab_name: string;
  pascal_name: string;
  original_name: string; // 原始文件名（去除权重后缀后）
  weight: IconWeight;
  path: string; // 相对 assets 根目录路径，如 icons/regular/paint-brush-regular.svg
}

export async function processIcons(options: ProcessIconsOptions = {}): Promise<IconOutputEntry[]> {
  const baseAssetsDir = options.baseAssetsDir ?? path.join(__dirname, "..", "assets");
  const originalDir = path.join(baseAssetsDir, "icons", "original");

  const hasOriginal = await fs.access(originalDir).then(() => true).catch(() => false);
  if (!hasOriginal) {
    console.warn(`[icons] skip: original directory not found at ${originalDir}`);
    return [];
  }

  // 每次执行都以 original 为准，直接覆盖写入即可（不做全量清空，避免意外删除自定义文件）
  const files = await listAssets(originalDir, [".svg"], false);
  const outputs: IconOutputEntry[] = [];

  for (const file of files) {
    const weight = detectWeightFromBase(file.baseName);
    const nameBase = stripWeightSuffix(file.baseName);
    const { kebab, pascal, original } = toNameVariants(nameBase);

    const outRel = path.join("icons", weight, `${kebab}-${weight}.svg`);
    const outAbs = path.join(baseAssetsDir, outRel);

    if (!options.dryRun) {
      await fs.mkdir(path.dirname(outAbs), { recursive: true });
      // SVG 颜色处理与压缩（仅 icons 文件夹）
      const processedSvg = await processSvgFile(file.path);
      await writeFile(outAbs, processedSvg);
    }

    outputs.push({ kebab_name: kebab, pascal_name: pascal, original_name: original, weight, path: outRel });
  }

  return outputs;
}

if (require.main === module) {
  (async () => {
    const dryRun = process.argv.includes("--dry");
    const outputs = await processIcons({ dryRun });
    console.log(`[icons] processed: ${outputs.length}`);
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

