
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic", 
  datasource: {   
    // Migrations use Neon's direct URL; local development can fall back to DATABASE_URL.
    url:
      process.env.DIRECT_URL ??
      process.env.DATABASE_URL ??
      "postgresql://neondb_owner:npg_tTI08wbNDkBr@ep-small-waterfall-ayxemhgm.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require",
  },
});
