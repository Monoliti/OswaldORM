import { DatabaseField } from "../core/database";
import { Field } from "../core/fields";
import { findDatabaseFiles, importDatabases } from "./utils";
import process from "process";

interface Migration {
  name: string;
  operations: string[];
}

interface CreateTableOperation {
  name: string;
  database: string;
  fields: Record<string, Field>;
}

function migration(data: Migration) {
  console.log("Migration ", data.name, " [x]");
}

async function createTable(data: CreateTableOperation): Promise<string> {
  const files = await findDatabaseFiles(process.cwd());
  const databases = await importDatabases(files);
  const database = databases.filter((db) => db.name === data.database)[0];

  await database.start();

  return database.engine.createTable({
    name: data.name,
    fields: Object.entries(data.fields).map(([name, field]) =>
      database.engine.fieldToDatabaseField(name, field, field.constraintsList)
    ),
  });
}

export const migrations = {
  migration,
  createTable,
};
