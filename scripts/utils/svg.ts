import { promises as fs } from "fs";
import { readTextFiles } from "./fs";

/**
 * SVG 颜色处理：将固定颜色（如 #000, #000000, black 等）替换为 currentColor
 * 这样 SVG 可以通过 CSS 的 color 属性来控制颜色
 */
export function processSvgColors(svgString: string): string {
  // 常见的黑色和灰色值，替换为 currentColor
  const colorMap: Record<string, string> = {
    "#000": "currentColor",
    "#000000": "currentColor",
    "rgb(0,0,0)": "currentColor",
    "rgb(0, 0, 0)": "currentColor",
    "black": "currentColor",
  };

  let processed = svgString;

  // 替换 fill 属性中的颜色
  processed = processed.replace(
    /fill=["']([^"']+)["']/gi,
    (match, color) => {
      const normalizedColor = color.trim().toLowerCase();
      const replacement = colorMap[normalizedColor];
      if (replacement) {
        return `fill="${replacement}"`;
      }
      return match;
    }
  );

  // 替换 stroke 属性中的颜色
  processed = processed.replace(
    /stroke=["']([^"']+)["']/gi,
    (match, color) => {
      const normalizedColor = color.trim().toLowerCase();
      const replacement = colorMap[normalizedColor];
      if (replacement) {
        return `stroke="${replacement}"`;
      }
      return match;
    }
  );

  // 替换 style 属性中的颜色
  processed = processed.replace(
    /style=["']([^"']*)["']/gi,
    (match, styleContent) => {
      let newStyle = styleContent;
      for (const [oldColor, newColor] of Object.entries(colorMap)) {
        const regex = new RegExp(
          `(fill|stroke):\\s*${oldColor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
          "gi"
        );
        newStyle = newStyle.replace(regex, `$1: ${newColor}`);
      }
      return `style="${newStyle}"`;
    }
  );

  return processed;
}

/**
 * 使用 svgo 优化 SVG（如果可用）
 * 如果 svgo 不可用，返回原始字符串
 */
export async function optimizeSvg(svgString: string): Promise<string> {
  try {
    // 动态导入 svgo，如果未安装则跳过优化
    const { optimize } = await import("svgo");
    const result = optimize(svgString, {
      plugins: [
        {
          name: "preset-default",
          params: {
            overrides: {
              // 保留 viewBox
              removeViewBox: false,
              // 保留 fill 和 stroke 属性（因为我们需要 currentColor）
              removeUselessStrokeAndFill: false,
            },
          },
        },
        // 移除注释
        "removeComments",
        // 移除空属性
        "removeEmptyAttrs",
      ],
    });

    return result.data || svgString;
  } catch (error) {
    // 如果 svgo 未安装，返回原始字符串
    console.warn("[svg] svgo not available, skipping optimization");
    return svgString;
  }
}

/**
 * 处理 SVG 文件的完整流程：读取 → 颜色处理 → 注入 fill → 优化 → 返回
 */
export async function processSvgFile(inputPath: string): Promise<string> {
  const svgContent = await fs.readFile(inputPath, "utf8");
  let processed = svgContent;

  // 1. 颜色处理
  processed = processSvgColors(processed);

  // 2. 优化
  processed = await optimizeSvg(processed);

  return processed;
}

