import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Prisma 7 removed auto-seeding; use explicit `db:seed` script instead
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
