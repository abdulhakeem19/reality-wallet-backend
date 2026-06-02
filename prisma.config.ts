import "dotenv/config";
import { defineConfig } from "prisma/config";

// Migrations are handled by scripts/migrate.js using pg directly.
// This config is only used by prisma generate (schema → TypeScript types).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
});
