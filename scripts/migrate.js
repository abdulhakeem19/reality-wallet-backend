#!/usr/bin/env node
'use strict';

/**
 * Applies Prisma migrations using pg directly — bypasses Prisma CLI's URL
 * parser which rejects Neon's hostname format with P1013.
 *
 * Reads migration SQL files from prisma/migrations/**, tracks applied
 * migrations in _prisma_migrations (same table Prisma uses), and runs
 * each migration in a transaction.
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'prisma', 'migrations');
const MIGRATIONS_TABLE = '_prisma_migrations';

async function main() {
  // Remove any whitespace/newlines that can sneak in when pasting into dashboards
  const connectionString = (process.env.DATABASE_URL ?? '').replace(/\s/g, '');
  if (!connectionString) {
    console.error('DATABASE_URL is not set — cannot run migrations');
    process.exit(1);
  }

  // pg handles Neon's pooler URL and channel_binding natively
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected. Running migrations...');

  // Ensure the Prisma migrations table exists
  await client.query(`
    CREATE TABLE IF NOT EXISTS "${MIGRATIONS_TABLE}" (
      "id"                  VARCHAR(36)  NOT NULL PRIMARY KEY,
      "checksum"            VARCHAR(64)  NOT NULL,
      "finished_at"         TIMESTAMPTZ,
      "migration_name"      VARCHAR(255) NOT NULL,
      "logs"                TEXT,
      "rolled_back_at"      TIMESTAMPTZ,
      "started_at"          TIMESTAMPTZ  NOT NULL DEFAULT now(),
      "applied_steps_count" INTEGER      NOT NULL DEFAULT 0
    )
  `);

  // Get names of already-applied migrations
  const { rows } = await client.query(
    `SELECT migration_name FROM "${MIGRATIONS_TABLE}" WHERE finished_at IS NOT NULL`
  );
  const applied = new Set(rows.map(r => r.migration_name));

  // Collect pending migrations in sorted order
  const pending = fs.readdirSync(MIGRATIONS_DIR)
    .filter(name => {
      const full = path.join(MIGRATIONS_DIR, name);
      return (
        fs.statSync(full).isDirectory() &&
        fs.existsSync(path.join(full, 'migration.sql')) &&
        !applied.has(name)
      );
    })
    .sort();

  if (pending.length === 0) {
    console.log('No pending migrations.');
    await client.end();
    return;
  }

  for (const name of pending) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, name, 'migration.sql'), 'utf8');
    const checksum = crypto.createHash('sha256').update(sql).digest('hex');
    const id = crypto.randomUUID();

    console.log(`Applying: ${name}`);

    // Record migration as started
    await client.query(
      `INSERT INTO "${MIGRATIONS_TABLE}" (id, checksum, migration_name, started_at, applied_steps_count)
       VALUES ($1, $2, $3, now(), 0)`,
      [id, checksum, name]
    );

    // Run in a transaction
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');

      await client.query(
        `UPDATE "${MIGRATIONS_TABLE}" SET finished_at = now(), applied_steps_count = 1 WHERE id = $1`,
        [id]
      );
      console.log(`✓ ${name}`);
    } catch (err) {
      await client.query('ROLLBACK');
      await client.query(
        `UPDATE "${MIGRATIONS_TABLE}" SET logs = $1, rolled_back_at = now() WHERE id = $2`,
        [err.message, id]
      );
      console.error(`✗ ${name}: ${err.message}`);
      await client.end();
      process.exit(1);
    }
  }

  console.log(`Done. Applied ${pending.length} migration(s).`);
  await client.end();
}

main();
