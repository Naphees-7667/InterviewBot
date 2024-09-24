/** @type { import("drizzle-kit").Config } */
export default {
  schema: "./utils/schema.js",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://neondb_owner:dK9jDSYq8oXZ@ep-falling-wildflower-a58pcgfk.us-east-2.aws.neon.tech/ai-interview-mocker?sslmode=require",
  },
};