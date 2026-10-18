import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const rawRoot = path.join(root, 'raw-assets');
const assetsRoot = path.join(root, 'assets');
const manifestPath = path.join(root, 'RESOURCE_LICENSE_MANIFEST.json');
const policy = JSON.parse(await fs.readFile(path.join(root, 'resource-license-policy.json'), 'utf8'));
const allowed = new Set(['.svg', '.png', '.jpg', '.jpeg', '.webp']);

const posix = value => value.split(path.sep).join('/');
const kebab = value => value
  .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
  .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
  .replace(/([A-Za-z])([0-9])/g, '$1-$2')
  .replace(/[\s_]+/g, '-')
  .toLowerCase();
const stripWeight = value => value.replace(/-(regular|thin|light|bold|fill|duotone)$/i, '');

async function walk(dir) {
  const result = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await walk(absolute));
    else if (allowed.has(path.extname(entry.name).toLowerCase())) result.push(absolute);
  }
  return result.sort();
}

async function sha256File(absolute) {
  return createHash('sha256').update(await fs.readFile(absolute)).digest('hex');
}

const rawFiles = await walk(rawRoot);
const packagedFiles = await walk(assetsRoot);
const rawFileHashes = new Map(await Promise.all(rawFiles.map(async absolute => [absolute, await sha256File(absolute)])));
const packagedFileHashes = new Map(await Promise.all(packagedFiles.map(async absolute => [absolute, await sha256File(absolute)])));
const grouped = new Map();

for (const absolute of rawFiles) {
  const relative = posix(path.relative(rawRoot, absolute));
  const parts = relative.split('/');
  const extension = path.extname(relative);
  const base = path.basename(relative, extension);
  let id;
  let kind;
  let group;
  let name;
  if (parts[0] === 'icons') {
    kind = 'icon';
    group = parts[1];
    name = kebab(stripWeight(base));
    id = `icon:${group}:${name}`;
  } else {
    kind = 'material';
    group = parts[0];
    name = kebab(base);
    id = `material:${group}:${name}`;
  }
  const current = grouped.get(id) ?? { id, kind, group, name, sourceFiles: [], sourceFileIntegrity: [], packagedFiles: [], packagedFileIntegrity: [] };
  const sourceFile = `raw-assets/${relative}`;
  current.sourceFiles.push(sourceFile);
  current.sourceFileIntegrity.push({ path: sourceFile, sha256: rawFileHashes.get(absolute) });
  grouped.set(id, current);
}

function candidatesForPackaged(relative) {
  const parts = relative.split('/');
  const extension = path.extname(relative);
  const base = path.basename(relative, extension);
  if (parts[0] === 'icons') {
    const collection = parts[1];
    const name = kebab(base);
    return [...grouped.values()].filter(item => item.kind === 'icon' && item.group === collection && item.name === name);
  }
  const group = parts[0];
  return [...grouped.values()].filter(item => {
    if (item.kind !== 'material' || item.group !== group) return false;
    return base === item.name || base.match(new RegExp(`^${item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-\\d+$`));
  });
}

const mappingErrors = [];
for (const absolute of packagedFiles) {
  const relative = posix(path.relative(assetsRoot, absolute));
  const matches = candidatesForPackaged(relative);
  if (matches.length !== 1) {
    mappingErrors.push({ packagedFile: `assets/${relative}`, matches: matches.map(item => item.id) });
    continue;
  }
  const packagedFile = `assets/${relative}`;
  matches[0].packagedFiles.push(packagedFile);
  matches[0].packagedFileIntegrity.push({ path: packagedFile, sha256: packagedFileHashes.get(absolute) });
}

const entries = [...grouped.values()].sort((a, b) => a.id.localeCompare(b.id)).map(item => {
  const rule = item.kind === 'icon'
    ? policy.collections[item.group]
    : (policy.materialGroups[item.group] ?? policy.materialGroups.default);
  if (!rule) {
    return {
      ...item,
      source: null,
      sourceVersion: null,
      rightsEvidence: [],
      applicableLicense: null,
      brandMark: 'review-required',
      resolution: { status: 'unresolved', reasons: ['policy-rule-missing'] },
    };
  }
  const reasons = [...rule.unresolved];
  if (item.packagedFiles.length === 0) reasons.push('packaged-output-missing');
  return {
    ...item,
    source: { name: rule.source, url: rule.sourceUrl },
    sourceVersion: rule.sourceVersion,
    rightsEvidence: rule.rightsEvidence,
    applicableLicense: rule.applicableLicense,
    brandMark: rule.brandMark,
    resolution: { status: reasons.length === 0 ? 'resolved' : 'unresolved', reasons: [...new Set(reasons)].sort() },
  };
});

const unresolved = entries.filter(entry => entry.resolution.status === 'unresolved');
const manifest = {
  schemaVersion: 1,
  package: '@snowui-design-system/resource-base',
  policySha256: createHash('sha256').update(JSON.stringify(policy)).digest('hex'),
  summary: {
    entries: entries.length,
    sourceFiles: entries.reduce((sum, entry) => sum + entry.sourceFiles.length, 0),
    packagedFiles: packagedFiles.length,
    resolved: entries.length - unresolved.length,
    unresolved: unresolved.length,
    mappingErrors: mappingErrors.length,
  },
  mappingErrors,
  assets: entries,
};
const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
const check = process.argv.includes('--check');
const publication = process.argv.includes('--publication');

if (check) {
  const current = await fs.readFile(manifestPath, 'utf8').catch(() => '');
  if (current !== serialized) {
    console.error('RESOURCE_LICENSE_MANIFEST.json is stale; run pnpm license:manifest.');
    process.exit(1);
  }
} else {
  await fs.writeFile(manifestPath, serialized);
}

if (mappingErrors.length > 0) {
  console.error(`Resource license mapping failed: ${mappingErrors.length} packaged files do not map exactly once.`);
  process.exit(1);
}
console.log(`Resource license mapping: ${entries.length} entries / ${packagedFiles.length} packaged files; unresolved ${unresolved.length}.`);
if (publication && unresolved.length > 0) {
  console.error('Publication blocked: unresolved asset rights evidence remains.');
  process.exit(1);
}
