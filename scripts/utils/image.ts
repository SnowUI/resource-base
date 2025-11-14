import { promises as fs } from "fs";
import * as path from "path";

/**
 * 支持的位图格式
 */
export const BITMAP_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"] as const;

/**
 * 检查文件是否为位图格式
 */
export function isBitmapFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return BITMAP_EXTENSIONS.includes(ext as any);
}

/**
 * 使用 sharp 压缩位图（如果可用）
 * 如果 sharp 不可用，返回原始 Buffer
 */
export async function compressImage(
  inputPath: string,
  outputPath?: string
): Promise<Buffer> {
  try {
    // 动态导入 sharp，如果未安装则跳过压缩
    const sharpModule = await import("sharp");
    // sharp 可能是 default 导出，也可能是命名导出
    const sharp = (sharpModule.default || sharpModule) as typeof import("sharp").default;
    
    // 读取原始文件大小
    const originalStats = await fs.stat(inputPath);
    const originalSize = originalStats.size;

    // 根据文件扩展名选择压缩策略
    const ext = path.extname(inputPath).toLowerCase();
    let processed = sharp(inputPath);

    if (ext === ".png") {
      // PNG 压缩：使用更激进的压缩设置
      // PNG 是无损格式，使用 compressionLevel 控制压缩（0-9，9 为最高压缩）
      processed = processed.png({
        compressionLevel: 9, // 最高压缩级别，文件最小但处理时间最长
        // 启用自适应过滤以获得更好的压缩
        adaptiveFiltering: true,
      });
    } else if (ext === ".jpg" || ext === ".jpeg") {
      // JPEG 压缩
      processed = processed.jpeg({
        quality: 85,
        mozjpeg: true,
        progressive: true,
      });
    } else if (ext === ".webp") {
      // WebP 压缩
      processed = processed.webp({
        quality: 85,
      });
    }

    const buffer = await processed.toBuffer();
    const compressedSize = buffer.length;

    // 如果提供了输出路径，写入文件
    if (outputPath) {
      await fs.writeFile(outputPath, buffer);
    }

    // 输出压缩信息
    const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);
    if (compressedSize < originalSize) {
      console.log(
        `   ✓ ${path.basename(inputPath)}: ${(originalSize / 1024).toFixed(1)}KB → ${(compressedSize / 1024).toFixed(1)}KB (${reduction}% reduction)`
      );
    } else {
      console.log(
        `   ⚠ ${path.basename(inputPath)}: ${(originalSize / 1024).toFixed(1)}KB (no reduction)`
      );
    }

    return buffer;
  } catch (error: any) {
    // 如果 sharp 未安装，读取原始文件并给出明确提示
    if (error?.code === "MODULE_NOT_FOUND" || error?.message?.includes("Cannot find module")) {
      console.error(
        `\n❌ [image] sharp is not installed! Please install it to enable image compression:`
      );
      console.error(`   pnpm add -D sharp`);
      console.error(`   or: pnpm add -D -w sharp (in workspace root)\n`);
    } else {
      console.warn(
        `[image] Error compressing ${inputPath}: ${error?.message || error}`
      );
    }
    return await fs.readFile(inputPath);
  }
}

/**
 * 调整图片尺寸（正方形，宽高相同）
 */
export async function resizeImage(
  inputPath: string,
  width: number,
  height: number,
  outputPath?: string
): Promise<Buffer> {
  try {
    const sharpModule = await import("sharp");
    const sharp = (sharpModule.default || sharpModule) as typeof import("sharp").default;
    
    const ext = path.extname(inputPath).toLowerCase();
    let processed = sharp(inputPath).resize(width, height, {
      fit: 'cover', // 保持宽高比，裁剪超出部分
      position: 'center',
    });

    if (ext === ".png") {
      processed = processed.png({ compressionLevel: 9, adaptiveFiltering: true });
    } else if (ext === ".jpg" || ext === ".jpeg") {
      processed = processed.jpeg({ quality: 85, mozjpeg: true, progressive: true });
    } else if (ext === ".webp") {
      processed = processed.webp({ quality: 85 });
    }

    const buffer = await processed.toBuffer();
    
    if (outputPath) {
      await fs.writeFile(outputPath, buffer);
    }

    return buffer;
  } catch (error: any) {
    if (error?.code === "MODULE_NOT_FOUND" || error?.message?.includes("Cannot find module")) {
      console.error(`\n❌ [image] sharp is not installed! Please install it to enable image resizing:`);
      console.error(`   pnpm add -D sharp`);
    } else {
      console.warn(`[image] Error resizing ${inputPath}: ${error?.message || error}`);
    }
    return await fs.readFile(inputPath);
  }
}

/**
 * 调整图片尺寸（宽度固定，高度自适应）
 */
export async function resizeImageByWidth(
  inputPath: string,
  width: number,
  outputPath?: string
): Promise<Buffer> {
  try {
    const sharpModule = await import("sharp");
    const sharp = (sharpModule.default || sharpModule) as typeof import("sharp").default;
    
    const ext = path.extname(inputPath).toLowerCase();
    let processed = sharp(inputPath).resize(width, null, {
      fit: 'inside', // 保持宽高比，高度自适应
      withoutEnlargement: true, // 不放大图片
    });

    if (ext === ".png") {
      processed = processed.png({ compressionLevel: 9, adaptiveFiltering: true });
    } else if (ext === ".jpg" || ext === ".jpeg") {
      processed = processed.jpeg({ quality: 85, mozjpeg: true, progressive: true });
    } else if (ext === ".webp") {
      processed = processed.webp({ quality: 85 });
    }

    const buffer = await processed.toBuffer();
    
    if (outputPath) {
      await fs.writeFile(outputPath, buffer);
    }

    return buffer;
  } catch (error: any) {
    if (error?.code === "MODULE_NOT_FOUND" || error?.message?.includes("Cannot find module")) {
      console.error(`\n❌ [image] sharp is not installed! Please install it to enable image resizing:`);
      console.error(`   pnpm add -D sharp`);
    } else {
      console.warn(`[image] Error resizing ${inputPath}: ${error?.message || error}`);
    }
    return await fs.readFile(inputPath);
  }
}

/**
 * 处理位图文件的完整流程：读取 → 压缩 → 返回 Buffer
 */
export async function processImageFile(inputPath: string): Promise<Buffer> {
  return await compressImage(inputPath);
}

