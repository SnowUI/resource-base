import { promises as fs } from "fs";
import * as path from "path";
import { writeFile } from "./utils/fs";

interface SyncConfig {
  source: "npm" | "api" | "git" | "auto";
  prefixes: string[];
  endpoint?: string;
  updateMappings: "suggest-only" | "auto";
  preserveManualMappings: boolean;
  verifySources?: Record<string, string>;
  lock?: Record<string, string | null>;
}

interface IconifyCollectionRaw {
  prefix: string;
  info?: {
    name?: string;
    license?: { title?: string; spdx?: string; url?: string };
    author?: { name?: string; url?: string };
    height?: number;
    samples?: string[];
    category?: string;
    palette?: boolean;
  };
  icons: Record<string, { body: string; left?: number; top?: number; width?: number; height?: number }>;
  aliases?: Record<string, { parent: string; hFlip?: boolean; vFlip?: boolean; rotate?: number }>;
  categories?: Record<string, string[]>;
  width?: number;
  height?: number;
}

interface SyncReport {
  mode: "auto" | "manual";
  generatedAt: string;
  source: "npm" | "api" | "none";
  config: SyncConfig;
  collections: Array<{
    prefix: string;
    iconCount: number;
    aliasCount: number;
    license?: string;
    version?: string;
  }>;
  warnings: string[];
  breaking: string[];
}

async function tryLoadFromNpm(prefix: string): Promise<IconifyCollectionRaw | null> {
  try {
    // Resolved relative to this script — requires `@iconify/json` to be installed in resource-base
    const pkgPath = require.resolve(`@iconify/json/json/${prefix}.json`, { paths: [path.join(__dirname, "..")] });
    const text = await fs.readFile(pkgPath, "utf-8");
    return JSON.parse(text) as IconifyCollectionRaw;
  } catch {
    return null;
  }
}

async function tryLoadFromApi(prefix: string, endpoint: string): Promise<IconifyCollectionRaw | null> {
  try {
    const url = `${endpoint.replace(/\/$/, "")}/collection?prefix=${encodeURIComponent(prefix)}&info=true&aliases=true`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const j: any = await res.json();
    // API 不返回 icons.body；这里只把 uncategorized + categories.* 合并成图标名列表
    const names = new Set<string>();
    for (const n of j.uncategorized ?? []) names.add(n as string);
    for (const arr of Object.values(j.categories ?? {}) as string[][]) {
      for (const n of arr) names.add(n);
    }
    for (const arr of Object.values(j.themes ?? {}) as string[][]) {
      for (const n of arr) names.add(n);
    }
    const icons: Record<string, { body: string }> = {};
    for (const n of names) icons[n] = { body: "" }; // body 留空，仅作存在性检查
    const aliases: Record<string, { parent: string }> = {};
    for (const [k, v] of Object.entries(j.aliases ?? {})) {
      aliases[k] = { parent: typeof v === "string" ? (v as string) : (v as any).parent };
    }
    return {
      prefix: j.prefix ?? prefix,
      info: j.info,
      icons,
      aliases,
    };
  } catch {
    return null;
  }
}

async function loadCollection(prefix: string, config: SyncConfig): Promise<{ data: IconifyCollectionRaw | null; via: "npm" | "api" | "none" }> {
  const order: Array<"npm" | "api"> = config.source === "auto" ? ["npm", "api"] : config.source === "git" ? ["api"] : [config.source as "npm" | "api"];

  for (const v of order) {
    if (v === "npm") {
      const d = await tryLoadFromNpm(prefix);
      if (d) return { data: d, via: "npm" };
    } else if (v === "api") {
      const d = await tryLoadFromApi(prefix, config.endpoint ?? "https://api.iconify.design");
      if (d) return { data: d, via: "api" };
    }
  }
  return { data: null, via: "none" };
}

export interface SyncOptions {
  mode?: "auto" | "manual";
  baseDir?: string;
  /** 仅在 auto 模式下：发现破坏性变化时是否以非 0 退出（默认 true）。 */
  strict?: boolean;
}

export async function syncIconify(options: SyncOptions = {}): Promise<SyncReport> {
  const baseDir = options.baseDir ?? path.join(__dirname, "..");
  const mode = options.mode ?? "manual";
  const configPath = path.join(baseDir, "iconify-sync.config.json");
  const outPath = path.join(baseDir, "src", "iconify-collections.ts");
  const reportDir = path.join(baseDir, "reports");

  let config: SyncConfig;
  try {
    config = JSON.parse(await fs.readFile(configPath, "utf-8")) as SyncConfig;
  } catch {
    console.warn(`[iconify-sync] no config at ${configPath}, skipping`);
    return {
      mode,
      generatedAt: new Date().toISOString(),
      source: "none",
      config: { source: "auto", prefixes: [], updateMappings: "suggest-only", preserveManualMappings: true },
      collections: [],
      warnings: ["config file not found"],
      breaking: [],
    };
  }

  const report: SyncReport = {
    mode,
    generatedAt: new Date().toISOString(),
    source: "none",
    config,
    collections: [],
    warnings: [],
    breaking: [],
  };

  const slim: Array<{
    prefix: string;
    name?: string;
    license?: string;
    icons: string[]; // 仅保存图标名作为索引；具体 SVG body 不打进运行时
    aliases: Record<string, string>;
  }> = [];

  let anySource: "npm" | "api" | "none" = "none";

  for (const prefix of config.prefixes ?? []) {
    const { data, via } = await loadCollection(prefix, config);
    if (!data) {
      report.warnings.push(`unable to load collection "${prefix}" from any source`);
      continue;
    }
    if (anySource === "none") anySource = via;

    const iconNames = Object.keys(data.icons ?? {}).sort();
    if (iconNames.length === 0) {
      report.warnings.push(`collection "${prefix}" has no icon names`);
      continue;
    }
    const aliasMap: Record<string, string> = {};
    for (const [name, info] of Object.entries(data.aliases ?? {})) {
      aliasMap[name] = info.parent;
    }

    slim.push({
      prefix,
      name: data.info?.name,
      license: data.info?.license?.title ?? data.info?.license?.spdx,
      icons: iconNames,
      aliases: aliasMap,
    });

    report.collections.push({
      prefix,
      iconCount: iconNames.length,
      aliasCount: Object.keys(aliasMap).length,
      license: data.info?.license?.title ?? data.info?.license?.spdx,
    });
  }

  report.source = anySource;

  // 同步必须取得完整输入。缺失来源时保留已审核的索引，避免离线构建覆盖公开资源。
  if (report.warnings.length > 0) {
    throw new Error(`[iconify-sync] incomplete source: ${report.warnings.join("; ")}`);
  }

  // 写 src/iconify-collections.ts（仅元数据，不嵌入 SVG body 以避免包体爆炸）
  const content = `// Auto-generated by scripts/sync-iconify.ts. Do not edit.
// Run \`pnpm sync:iconify\` to regenerate.

export interface IconifyCollectionMeta {
  prefix: string;
  name?: string;
  license?: string;
  icons: readonly string[];
  aliases: Readonly<Record<string, string>>;
}

export const iconifyCollections: readonly IconifyCollectionMeta[] = ${JSON.stringify(slim, null, 2)} as const;

export function findIconifyCollection(prefix: string): IconifyCollectionMeta | undefined {
  return iconifyCollections.find((c) => c.prefix === prefix);
}

export function hasIconifyIcon(prefix: string, name: string): boolean {
  const col = findIconifyCollection(prefix);
  if (!col) return false;
  if (col.icons.includes(name)) return true;
  return col.aliases[name] !== undefined;
}
`;
  await writeFile(outPath, content);

  // 写报告
  await fs.mkdir(reportDir, { recursive: true });
  await fs.writeFile(path.join(reportDir, "iconify-sync-report.json"), JSON.stringify(report, null, 2));

  const md: string[] = [];
  md.push(`# Iconify Sync Report`);
  md.push("");
  md.push(`- Mode: \`${report.mode}\``);
  md.push(`- Source: \`${report.source}\``);
  md.push(`- Generated: ${report.generatedAt}`);
  md.push("");
  md.push(`## Collections`);
  md.push("");
  md.push(`| Prefix | Icons | Aliases | License |`);
  md.push(`| --- | ---: | ---: | --- |`);
  for (const c of report.collections) {
    md.push(`| ${c.prefix} | ${c.iconCount} | ${c.aliasCount} | ${c.license ?? "-"} |`);
  }
  if (report.warnings.length > 0) {
    md.push("");
    md.push(`## Warnings`);
    md.push("");
    for (const w of report.warnings) md.push(`- ${w}`);
  }
  if (report.breaking.length > 0) {
    md.push("");
    md.push(`## ⚠️ Breaking changes`);
    md.push("");
    for (const b of report.breaking) md.push(`- ${b}`);
  }
  await fs.writeFile(path.join(reportDir, "iconify-sync-report.md"), md.join("\n"));

  return report;
}

if (require.main === module) {
  (async () => {
    const args = process.argv.slice(2);
    const modeArg = args.find((a) => a.startsWith("--mode="));
    const mode = (modeArg?.split("=")[1] as "auto" | "manual" | undefined) ?? "manual";
    const strict = !args.includes("--no-strict");
    const report = await syncIconify({ mode, strict });

    console.log(`\n[iconify-sync] mode=${report.mode} source=${report.source}`);
    for (const c of report.collections) {
      console.log(`  ${c.prefix.padEnd(20)} icons=${c.iconCount}  aliases=${c.aliasCount}`);
    }
    if (report.warnings.length > 0) {
      console.log(`\n  ⚠️  ${report.warnings.length} warning(s):`);
      for (const w of report.warnings) console.log(`    - ${w}`);
    }
    if (report.breaking.length > 0) {
      console.log(`\n  ❌ ${report.breaking.length} breaking change(s)`);
      if (strict && mode === "auto") {
        console.error(`\n[iconify-sync] strict mode + auto: exiting non-zero due to breaking changes`);
        process.exit(2);
      }
    }
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
