import { neon } from "@neondatabase/serverless";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defaultDishes } from "../app/menu/data.js";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, "..");
const localEnvironment = await readFile(
  path.join(projectDirectory, ".env.local"),
  "utf8",
).catch((error) => {
  if (error.code === "ENOENT") return "";
  throw error;
});
const localDatabaseUrl = localEnvironment
  .match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/m)?.[1]
  ?.replace(/^["']|["']$/g, "");
const connectionString = process.env.DATABASE_URL || localDatabaseUrl;
if (!connectionString) {
  throw new Error("Set DATABASE_URL before running the database migration.");
}

const schema = await readFile(
  path.join(scriptDirectory, "..", "db", "schema.sql"),
  "utf8",
);
const sql = neon(connectionString);

try {
  for (const statement of schema.split(";").map((part) => part.trim()).filter(Boolean)) {
    await sql.query(statement);
  }
  for (const dish of defaultDishes) {
    await sql`
      INSERT INTO addis_eats_dishes
        (id, name, category, price, image, description, ingredients, prep_time, available)
      VALUES
        (${dish.id}, ${dish.name}, ${dish.category}, ${dish.price}, ${dish.image},
         ${dish.description}, ${dish.ingredients}, ${dish.prepTime}, true)
      ON CONFLICT (id) DO NOTHING
    `;
  }
  console.log("Addis Eats order and menu schema is ready.");
} catch (error) {
  console.error("Addis Eats database migration failed.", {
    name: error.name,
    code: error.code,
  });
  process.exitCode = 1;
}
