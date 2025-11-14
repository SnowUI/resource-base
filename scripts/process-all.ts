import * as path from "path";
import { processMaterials } from "./process-materials";
import { processIcons } from "./process-icons";
import { updateCatalog } from "./utils/catalog";

/**
 * 统一处理所有素材和图标
 * 
 * 处理顺序：
 * 1. 先处理 materials（avatars/backgrounds/cursors 等）
 *    - 位图格式（PNG、JPG 等）：进行压缩优化
 *    - SVG 格式：直接复制（不进行颜色处理）
 * 2. 再处理 icons
 *    - SVG 格式：进行颜色处理（currentColor 替换）和压缩优化
 * 
 * 处理规则：
 * - SVG 颜色处理仅应用于 icons 文件夹
 * - 图片压缩排除 icons 文件夹，只处理其他文件夹中的位图格式
 * - 如果 icons 和 materials 有重名，引用时优先使用 icons 里的素材
 * - 不同类别的 materials 之间可以重名（如 avatars 和 cursors 可以有同名文件）
 */
async function main() {
  const dryRun = process.argv.includes("--dry");
  const baseAssetsDir = path.join(__dirname, "..", "assets");

  console.log("🚀 Starting asset processing...");
  console.log("");

  // 步骤 1: 处理 materials（排除 icons）
  console.log("📦 Step 1: Processing materials (avatars, backgrounds, cursors, etc.)");
  console.log("   - Bitmap images (PNG, JPG, etc.): Compressing...");
  console.log("   - SVG files: Copying as-is (no color processing)");
  const materials = await processMaterials({ baseAssetsDir, dryRun, excludeGroups: ["icons"] });
  console.log(`   ✅ Processed ${materials.length} material entries`);
  console.log("");

  // 步骤 2: 处理 icons（优先级更高）
  console.log("🎨 Step 2: Processing icons");
  console.log("   - SVG files: Color processing (currentColor) + optimization");
  const icons = await processIcons({ baseAssetsDir, dryRun });
  console.log(`   ✅ Processed ${icons.length} icon entries`);
  console.log("");

  // 步骤 3: 更新 catalog（元数据文件）
  console.log("📚 Step 3: Updating catalog (metadata)");
  await updateCatalog({
    icons,
    materials,
    baseDir: path.join(__dirname, ".."),
  });
  console.log("");

  console.log(`✅ [all] Complete! materials: ${materials.length}, icons: ${icons.length}`);
  console.log(`💡 Note: If duplicate names exist, icons take priority over materials.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
