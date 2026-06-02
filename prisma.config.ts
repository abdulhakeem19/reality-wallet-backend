import "dotenv/config";
import { defineConfig } from "prisma/config";

// prisma migrate deploy needs a direct (non-pooler) connection.
// Neon pooler URLs contain '-pooler' in the hostname and channel_binding
// in the query string — both of which Prisma's CLI rejects.
// DIRECT_DATABASE_URL can be set explicitly in Render; otherwise we derive
// it by stripping '-pooler' and 'channel_binding' from DATABASE_URL.
const raw = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? "";

const migrationUrl = raw
  .replace(/-pooler\./, ".")              // ep-xxx-pooler.host → ep-xxx.host
  .replace(/&channel_binding=[^&]*/, "")  // strip &channel_binding=...
  .replace(/\?channel_binding=[^&]*&/, "?")
  .replace(/\?channel_binding=[^&]*$/, "");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrationUrl,
  },
});
