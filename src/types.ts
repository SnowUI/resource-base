/**
 * 图标权重类型
 */
export type IconWeight = "regular" | "thin" | "light" | "bold" | "fill" | "duotone";

/**
 * 图标条目类型
 */
export interface IconEntry {
  /** 图标名称（kebab-case） */
  name: string;
  /** PascalCase 名称 */
  pascal_name: string;
  /** 原始名称（如果与 name 不同） */
  alias?: {
    name: string;
    pascal_name: string;
  };
  /** 支持的权重列表 */
  weights: IconWeight[];
}

/**
 * 素材条目类型
 */
export interface AssetEntry {
  /** 素材类型（avatars、backgrounds、cursors 等） */
  type: string;
  /** 素材名称（kebab-case） */
  name: string;
  /** PascalCase 名称 */
  pascal_name: string;
  /** 原始名称（如果与 name 不同） */
  alias?: {
    name: string;
    pascal_name: string;
  };
  /** 文件列表 */
  files: Array<{
    /** 文件格式（svg、png、jpg 等） */
    format: string;
    /** 相对 assets 根目录的路径 */
    path: string;
  }>;
}

