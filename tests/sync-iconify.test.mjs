import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { syncIconify } = require('../scripts/sync-iconify.ts');
const { iconifyCollections } = require('../src/iconify-collections.ts');

test('已提交的 Iconify 索引包含全部配置图标库', async () => {
  const config = JSON.parse(await readFile(new URL('../iconify-sync.config.json', import.meta.url), 'utf8'));
  assert.deepEqual(iconifyCollections.map((collection) => collection.prefix), config.prefixes);
  for (const collection of iconifyCollections) assert.ok(collection.icons.length > 0);
});

test('任一在线来源不可用时不覆盖已有索引', async () => {
  const baseDir = await mkdtemp(join(tmpdir(), 'snowui-iconify-sync-'));
  await mkdir(join(baseDir, 'src'));
  await writeFile(join(baseDir, 'src', 'iconify-collections.ts'), 'reviewed index\n');
  await writeFile(join(baseDir, 'iconify-sync.config.json'), JSON.stringify({
    source: 'api',
    prefixes: ['ph', 'mdi'],
    endpoint: 'https://example.invalid',
    updateMappings: 'suggest-only',
    preserveManualMappings: true
  }));

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (String(url).includes('prefix=ph')) {
      return { ok: true, json: async () => ({ prefix: 'ph', uncategorized: ['alarm'] }) };
    }
    throw new Error('offline');
  };
  try {
    await assert.rejects(syncIconify({ baseDir, mode: 'auto' }), /incomplete source.*mdi/);
    assert.equal(await readFile(join(baseDir, 'src', 'iconify-collections.ts'), 'utf8'), 'reviewed index\n');
  } finally {
    globalThis.fetch = originalFetch;
    await rm(baseDir, { recursive: true, force: true });
  }
});
