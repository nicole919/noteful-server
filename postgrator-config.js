require("dotenv").config();

module.exports = {
  validateChecksums: false,
  migrationDirectory: "migrations",
  driver: "pg",
  connectionString:
    process.env.NODE_ENV === "test"
      ? process.env.TEST_DATABASE_URL
      : process.env.DATABASE_URL,
  ssl: true
};
