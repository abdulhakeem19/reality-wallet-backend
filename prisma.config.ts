import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma's CLI URL parser doesn't support channel_binding — strip it so
// `prisma migrate deploy` works. The runtime PrismaPg adapter reads
// DATABASE_URL directly and handles the full connection string fine.
function stripChannelBinding(url: string): string {
  // Remove &channel_binding=... or ?channel_binding=...& or ?channel_binding=...
  return url
    .replace(/&channel_binding=[^&]*/, "")         // mid/end: ...&channel_binding=...
    .replace(/\?channel_binding=[^&]*&/, "?")      // first, more follow: ?channel_binding=...&
    .replace(/\?channel_binding=[^&]*$/, "");       // only param: ?channel_binding=...
}

const migrationUrl = stripChannelBinding(process.env["DATABASE_URL"] ?? "");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrationUrl,
  },
});
