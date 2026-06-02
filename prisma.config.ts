import "dotenv/config";
import { defineConfig } from "prisma/config";

// URL is provided via schema.prisma env("DATABASE_URL").
// For migrations, scripts/migrate.js overrides DATABASE_URL with a clean
// direct connection string before spawning prisma migrate deploy.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
});
