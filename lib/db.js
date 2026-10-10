import "server-only";

import { neon } from "@neondatabase/serverless";

let connectionString;
let client;

export function getDatabase() {
  const currentConnectionString = process.env.DATABASE_URL;
  if (!currentConnectionString) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL must be configured for production order storage.");
    }
    return null;
  }

  if (currentConnectionString !== connectionString) {
    connectionString = currentConnectionString;
    client = neon(currentConnectionString);
  }

  return client;
}
