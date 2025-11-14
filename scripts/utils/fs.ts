import { promises as fs } from "fs";
import * as path from "path";

// 轻量级的文件系统工具，封装 Node.js API，给素材处理脚本提供统一能力，避免直接依赖完整的 @types/node。

// 描述目录扫描过程中发现的单个文件。
export interface AssetFile {
  /** 文件的绝对路径 */
  path: string;
  /** 文件所在目录 */
  dir: string;
  /** 带扩展名的文件名 */
  name: string;
  /** 去除扩展名后的文件名 */
  baseName: string;
  /** 带点的扩展名，已统一为小写 */
  ext: string;
}

// 将任意路径片段解析为绝对路径。
export function resolvePath(...segments: string[]): string {
  return path.resolve(...segments);
}

// 写文件前确保目录存在。
export async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

// 扫描目录（可递归）并按扩展名过滤文件。
export async function listAssets(
  dir: string,
  exts: string[] = [".svg", ".png"],
  recursive = false
): Promise<AssetFile[]> {
  const absoluteDir = resolvePath(dir);
  const entries = await fs.readdir(absoluteDir, { withFileTypes: true });

  const normalizedExts = new Set(exts.map((ext) => ext.toLowerCase()));
  const results: AssetFile[] = [];

  for (const entry of entries) {
    const entryPath = path.join(absoluteDir, entry.name);

    if (entry.isDirectory()) {
      if (recursive) {
        const nested = await listAssets(entryPath, Array.from(normalizedExts), true);
        results.push(...nested);
      }
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (normalizedExts.size > 0 && !normalizedExts.has(ext)) {
      continue;
    }

    const baseName = path.basename(entry.name, ext);
    results.push({
      path: entryPath,
      dir: absoluteDir,
      name: entry.name,
      baseName,
      ext,
    });
  }

  return results.sort((a, b) => a.path.localeCompare(b.path));
}

// 并行读取 UTF-8 文本文件，返回以绝对路径为键的字典。
export async function readTextFiles(files: AssetFile[]): Promise<Record<string, string>> {
  const payload: Record<string, string> = {};

  await Promise.all(
    files.map(async (file) => {
      payload[file.path] = await fs.readFile(file.path, "utf8");
    })
  );

  return payload;
}

// 复制文件到目标路径，并在需要时创建父目录。
export async function copyFile(src: string, dest: string): Promise<void> {
  await ensureDir(path.dirname(dest));
  await fs.copyFile(src, dest);
}

// 写入文本或二进制数据到磁盘，确保目标目录已存在。
export async function writeFile(dest: string, contents: string | Uint8Array): Promise<void> {
  await ensureDir(path.dirname(dest));
  await fs.writeFile(dest, contents);
}

