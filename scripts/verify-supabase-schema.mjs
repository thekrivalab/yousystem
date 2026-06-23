#!/usr/bin/env node
/**
 * Validates that Supabase migration files define the expected schema.
 * Run after applying migrations: npm run db:verify
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MIGRATIONS_DIR = join(ROOT, 'supabase/migrations');

const EXPECTED_TABLE = 'user_storage_snapshots';
const REQUIRED_COLUMNS = [
  'user_id',
  'payload',
  'created_at',
  'updated_at',
  'sync_version',
];

function readMigrations() {
  if (!existsSync(MIGRATIONS_DIR)) {
    console.error('❌ Missing supabase/migrations directory');
    process.exit(1);
  }

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.error('❌ No migration files found');
    process.exit(1);
  }

  return files.map((file) => ({
    file,
    content: readFileSync(join(MIGRATIONS_DIR, file), 'utf8'),
  }));
}

function assertColumnCoverage(migrations) {
  const combined = migrations.map((m) => m.content).join('\n');
  const missing = REQUIRED_COLUMNS.filter((col) => {
    const patterns = [
      new RegExp(`\\b${col}\\b`, 'i'),
      new RegExp(`add column if not exists\\s+${col}`, 'i'),
    ];
    return !patterns.some((p) => p.test(combined));
  });

  if (missing.length > 0) {
    console.error(`❌ Required columns not found in migrations: ${missing.join(', ')}`);
    process.exit(1);
  }
}

function assertTableCreation(migrations) {
  const combined = migrations.map((m) => m.content).join('\n');
  if (!combined.includes(EXPECTED_TABLE)) {
    console.error(`❌ Table ${EXPECTED_TABLE} not referenced in migrations`);
    process.exit(1);
  }
}

function assertRls(migrations) {
  const combined = migrations.map((m) => m.content).join('\n');
  if (!/enable row level security/i.test(combined)) {
    console.error('❌ RLS not enabled in migrations');
    process.exit(1);
  }
  if (!/auth\.uid\(\)\s*=\s*user_id/i.test(combined)) {
    console.error('❌ RLS policies missing auth.uid() = user_id check');
    process.exit(1);
  }
}

function assertSyncVersionMigration(migrations) {
  const syncMigration = migrations.find((m) => m.file.includes('sync_version'));
  if (!syncMigration) {
    console.error('❌ Missing sync_version migration');
    process.exit(1);
  }
  if (!/add column if not exists sync_version/i.test(syncMigration.content)) {
    console.error('❌ sync_version migration must use idempotent ADD COLUMN IF NOT EXISTS');
    process.exit(1);
  }
}

function main() {
  console.log('Verifying Supabase schema migrations...\n');
  const migrations = readMigrations();

  migrations.forEach((m) => console.log(`  ✓ ${m.file}`));

  assertTableCreation(migrations);
  assertColumnCoverage(migrations);
  assertRls(migrations);
  assertSyncVersionMigration(migrations);

  console.log('\n✅ Schema verification passed');
  console.log(`   Table: ${EXPECTED_TABLE}`);
  console.log(`   Columns: ${REQUIRED_COLUMNS.join(', ')}`);
}

main();
