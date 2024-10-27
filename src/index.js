const { Client } = require("pg");
const getLogs = require("./fetch");

const chain = "gnosis";

const client = new Client({
  user: "wind",
  host: "localhost",
  database: "tokens_database",
  password: "0880",
  port: 5432,
});

const connecter = async () => {
  try {
    await client.connect();
    console.log(
      `Connected to database ${client.database} at port ${client.port}`
    );
    const res = await client.query("SELECT NOW()");
    console.log(res.rows);
    getLogs(chain, client);
  } catch (err) {
    console.error("Error connecting to database: ", err);
  }
};

connecter();
