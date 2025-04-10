const readline = require("readline");
const { Client } = require("pg");
const Cursor = require("pg-cursor");
require("dotenv").config();

let client = null;
let cursor = null;
let transactionOpen = false;

async function sqlCommand() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    historySize: 100,
  });
  rl.setPrompt("sql>");
  let sqlLine = "";
  rl.prompt();

  rl.on("line", async (line) => {
    sqlLine += line;
    if (!sqlLine.includes(";")) {
      rl.setPrompt("");
      rl.prompt();
    } else {
      try {
        const actionString = sqlLine.trim();
        if (actionString == "BEGIN;") {
          transactionOpen = true;
        } else if (actionString == "COMMIT;" || actionString == "ROLLBACK;") {
          transactionOpen = false;
        }
        if (!client) {
          client = new Client({ connectionString: process.env.DB_URL });
          await client.connect();
          client.on("error", () => {
            console.log(
              "\nA connection failure or timeout occurred.  Any transactions in process have been rolled back.\nsql>",
            );
            if (cursor) {
              cursor.close();
              cursor = null;
            }
            if (client) {
              client.end();
              client = null;
            }
            transactionOpen = false;
          });
        }
        cursor = client.query(new Cursor(sqlLine, [], { rowMode: "array" }));
        let firstRow = true;
        let rows;
        while (true) {
          rows = await cursor.read(100);
          if (firstRow) {
            const columnNames = cursor._result.fields.map(
              (field) => field.name,
            );
            console.log(columnNames.join("\t"));
            firstRow = false;
          }
          if (rows && rows.length) {
            rows.forEach((row) => {
              const rowStrings = row.map((column) => column.toString());
              console.log(rowStrings.join("\t"));
            });
          } else {
            break;
          }
        }
      } catch (error) {
        // This is a mystery error, assumed to be not recoverable
        console.log("96");
        console.log(
          `An error occurred: ${error.name} ${error.message} ${error.stack}`,
        );
      }
      cursor.close();
      cursor = null;
      if (!transactionOpen) {
        client.end();
        client = null;
      }
      rl.setPrompt("sql>");
      sqlLine = "";
      rl.prompt();
    }
  });
}

console.log(
  "The tables in this database are customers, employees, products, orders, and line_items.  Enter SQL statements below.  Each statement must end in a semicolon.",
);

sqlCommand();
