import { glob } from "glob";

export async function findMigrationFiles(
  rootPath: string = ""
): Promise<string[]> {
  return glob([`${rootPath}/**/*.migration.ts`], { ignore: "node_modules/**" });
}

export async function applyMigration(migrationPath: string): Promise<void> {
  await import("../../" + migrationPath);
}
