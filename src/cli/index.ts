import { createMigrationFolder, makeMigration } from "./makeMigration";
import { applyMigration, findMigrationFiles } from "./migrate";
import { findModelFiles, importModels } from "./utils";

const { Command } = require("commander");
const program = new Command();

program.name("oswaldORM").description("ORM for Typescript").version("0.0.1");

program
  .command("makemigrations")
  .description("Creates migrations for all .models.ts files.")
  .argument("<path>", "root path")
  .action(async (path: string = ".") => {
    const files = await findModelFiles(path);
    const models = await importModels(files);
    createMigrationFolder(path);
    makeMigration(path + "/migrations", models);
  });

program
  .command("migrate")
  .description("Runs all migration files.")
  .argument("<path>", "root path")
  .action(async (path: string = ".") => {
    const files = await findMigrationFiles(path);
    files.forEach((f) => applyMigration(f));
  });

program.parse();
