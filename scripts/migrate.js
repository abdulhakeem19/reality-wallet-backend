#!/usr/bin/env node
'use strict';

/**
 * Runs prisma migrate deploy with a clean direct-connection URL.
 * Prisma's CLI rejects pooler URLs (with -pooler in hostname) and the
 * channel_binding query param. We strip both before passing the URL
 * via the child process environment — bypassing prisma.config.ts entirely.
 */

const { execSync } = require('child_process');

const raw = process.env.DATABASE_URL ?? '';

if (!raw) {
  console.error('ERROR: DATABASE_URL is not set');
  process.exit(1);
}

const directUrl = raw
  .replace(/-pooler\./, '.')              // pooler host → direct host
  .replace(/&channel_binding=[^&]*/, '')  // strip &channel_binding=...
  .replace(/\?channel_binding=[^&]*&/, '?')
  .replace(/\?channel_binding=[^&]*$/, '');

console.log('Running prisma migrate deploy...');

execSync('npx prisma migrate deploy', {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: directUrl },
});
