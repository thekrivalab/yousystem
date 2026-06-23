#!/usr/bin/env node
/**
 * Summarize Next.js build output sizes from .next directory.
 * Run after: npm run build && npm run analyze:bundle
 */
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const NEXT_DIR = join(__dirname, '../.next');

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile() && /\.(js|css)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function main() {
  if (!existsSync(NEXT_DIR)) {
    console.error('❌ Run npm run build first');
    process.exit(1);
  }

  const staticDir = join(NEXT_DIR, 'static');
  const files = walk(staticDir);

  const sorted = files
    .map((f) => ({ path: f.replace(NEXT_DIR, '.next'), size: statSync(f).size }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 25);

  console.log('Top 25 static assets (.js/.css):\n');
  sorted.forEach(({ path, size }) => {
    console.log(`${formatBytes(size).padStart(10)}  ${path}`);
  });

  const total = files.reduce((sum, f) => sum + statSync(f).size, 0);
  console.log(`\nTotal static JS/CSS: ${formatBytes(total)} (${files.length} files)`);
}

main();
