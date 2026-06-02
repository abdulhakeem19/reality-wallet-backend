#!/usr/bin/env node
'use strict';

/**
 * Runs prisma migrate deploy with a direct Neon connection URL.
 * Strips -pooler from the hostname and channel_binding from query params
 * so Prisma's CLI can connect. Sets DATABASE_URL in the child process
 * environment — schema.prisma reads it via env("DATABASE_URL").
 */

const { execSync } = require('child_process');

const raw = (process.env.DATABASE_URL ?? '').trim();

if (!raw) {
  console.error('ERROR: DATABASE_URL is not set');
  process.exit(1);
}

const directUrl = raw
  .replace(/-pooler\./, '.')              // ep-xxx-pooler.host → ep-xxx.host
  .replace(/&channel_binding=[^&]*/, '')  // strip &channel_binding=...
  .replace(/\?channel_binding=[^&]*&/, '?')
  .replace(/\?channel_binding=[^&]*$/, '');

// Log host only (no credentials) so we can verify the URL in deploy logs
try {
  const host = directUrl.split('@')[1]?.split('/')[0] ?? 'unknown';
  console.log(`Running prisma migrate deploy → host: ${host}`);
} catch (_) {
  console.log('Running prisma migrate deploy...');
}

execSync('npx prisma migrate deploy', {
  stdio: 'inherit',
  env: {
    ...process.env,
    DATABASE_URL: directUrl,
  },
});
