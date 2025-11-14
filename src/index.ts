/**
 * @snowui-design-system/resource-core
 * 
 * SnowUI Design Resource Core
 * 提供设计素材的元数据和资源文件
 */

// 导出类型定义
export type { IconEntry, AssetEntry, IconWeight } from "./types";

// 导出图标元数据
export {
  icons,
  findIcon,
  findIconByPascalName,
  getAllIconNames,
} from "./icons";

// 导出素材元数据
export {
  assets,
  findAsset,
  getAssetsByType,
  getAllAssetTypes,
} from "./assets";

