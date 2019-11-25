const knex = require("knex");
const app = require("./app");
const { PORT, DB_URL } = require("./config");

//set database connection via knex instance, to be used by service objects
const db = knex({
  client: "pg",
  connection: DB_URL
});
app.set("db", db);

//listen to port depending on environment
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
