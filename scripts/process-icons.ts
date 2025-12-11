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
  /** 生成输出目录，默认 scripts 同级的 ../assets */
  baseAssetsDir?: string;
  /** 原始图标目录，默认 ../raw-assets/icons（必需） */
  rawIconsDir?: string;
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

// 检查是否仅包含黑/白（含透明度）颜色；若有其他颜色则应保留原始文件
function isMonochromeBlackWhite(svg: string): boolean {
  const colorPattern = /(#(?:[0-9a-fA-F]{3,8}))|rgba?\s*\(\s*([0-9.\s,%]+)\s*\)|(black|white)/gi;
  let match: RegExpExecArray | null;

  const isHexMono = (hex: string): boolean => {
    let h = hex.toLowerCase();
    h = h.startsWith("#") ? h.slice(1) : h;
    if (h.length === 3) {
      h = h.split("").map((c) => c + c).join(""); // abc -> aabbcc
    } else if (h.length === 4) {
      const rgb = h.slice(0, 3).split("").map((c) => c + c).join("");
      const a = h.slice(3).repeat(2);
      h = rgb + a;
    }
    if (h.length === 6) {
      return h === "000000" || h === "ffffff";
    }
    if (h.length === 8) {
      const rgb = h.slice(0, 6);
      return rgb === "000000" || rgb === "ffffff";
    }
    return false;
  };

  const isRgbMono = (nums: string): boolean => {
    const parts = nums.split(",").map((v) => v.trim()).filter(Boolean);
    if (parts.length < 3) return false;
    const rgb = parts.slice(0, 3).map((p) => {
      if (p.endsWith("%")) return Math.round((parseFloat(p) / 100) * 255);
      return parseFloat(p);
    });
    const [r, g, b] = rgb;
    return (r === 0 && g === 0 && b === 0) || (r === 255 && g === 255 && b === 255);
  };

  while ((match = colorPattern.exec(svg)) !== null) {
    const [, hex, rgbNums, named] = match;
    if (hex) {
      if (!isHexMono(hex)) return false;
    } else if (rgbNums) {
      if (!isRgbMono(rgbNums)) return false;
    } else if (named) {
      const n = named.toLowerCase();
      if (n !== "black" && n !== "white") return false;
    }
  }
  return true;
}

export async function processIcons(options: ProcessIconsOptions = {}): Promise<IconOutputEntry[]> {
  const baseAssetsDir = options.baseAssetsDir ?? path.join(__dirname, "..", "assets");
  const rawIconsDir = options.rawIconsDir ?? path.join(__dirname, "..", "raw-assets", "icons");

  const hasRaw = await fs.access(rawIconsDir).then(() => true).catch(() => false);
  if (!hasRaw) {
    console.warn(`[icons] skip: raw icons directory not found at ${rawIconsDir}`);
    return [];
  }

  // 每次执行都以 raw 目录为准，直接覆盖写入即可（不做全量清空，避免意外删除自定义文件）
  const files = await listAssets(rawIconsDir, [".svg"], false);
  const outputs: IconOutputEntry[] = [];

  for (const file of files) {
    const weight = detectWeightFromBase(file.baseName);
    const nameBase = stripWeightSuffix(file.baseName);
    const { kebab, pascal, original } = toNameVariants(nameBase);

    const outRel = path.join("icons", weight, `${kebab}-${weight}.svg`);
    const outAbs = path.join(baseAssetsDir, outRel);

    if (!options.dryRun) {
      await fs.mkdir(path.dirname(outAbs), { recursive: true });
      const rawContent = await fs.readFile(file.path, "utf8");
      // 如果检测到非黑/白颜色，直接保留原始内容；否则按既有流程处理
      if (!isMonochromeBlackWhite(rawContent)) {
        await writeFile(outAbs, rawContent);
      } else {
        const processedSvg = await processSvgFile(file.path);
        await writeFile(outAbs, processedSvg);
      }
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

