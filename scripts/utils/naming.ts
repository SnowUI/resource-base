interface NameVariants {
  /** 原始名称（不含扩展名） */
  original: string;
  /** kebab-case 名称 */
  kebab: string;
  /** PascalCase 名称 */
  pascal: string;
  /** 如果转换后与原始名称不同，则提供别名信息 */
  alias?: {
    name: string;
    pascal_name: string;
  };
}

const WORD_BOUNDARY = /([a-z0-9])([A-Z])|([A-Za-z])([0-9])/g;

/**
 * 将原始文件名转换为项目统一的命名格式
 */
export function toNameVariants(raw: string): NameVariants {
  const sanitized = raw
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .trim();

  const words = sanitized
    .replace(WORD_BOUNDARY, "$1$3 $2$4")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());

  const kebab = words.join("-");
  const pascal = words.map((word) => word[0]?.toUpperCase() + word.slice(1)).join("");

  const lowerSanitized = sanitized.toLowerCase().replace(/\s+/g, "-");
  const alias = lowerSanitized !== kebab ? { name: sanitized, pascal_name: pascal } : undefined;

  return {
    original: raw,
    kebab,
    pascal,
    alias,
  };
}

