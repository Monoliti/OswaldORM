import { glob } from "glob";
import { AbstractModel } from "../core/model";
import { Database } from "../core/database";

export async function findModelFiles(rootPath: string = ""): Promise<string[]> {
  return glob([`${rootPath}/**/*.models.ts`, `${rootPath}/**/models.ts`], {
    ignore: "node_modules/**",
  });
}

export async function findDatabaseFiles(
  rootPath: string = ""
): Promise<string[]> {
  return glob(
    [`${rootPath}/**/*.databases.ts`, `${rootPath}/**/databases.ts`],
    { ignore: "node_modules/**" }
  );
}

export async function importModels(
  paths: string[]
): Promise<(new () => AbstractModel)[]> {
  const models: (new () => AbstractModel)[] = [];

  for (const path of paths) {
    const modules = await import("../../" + path);

    Object.values(modules).forEach((v: any) => {
      if (v.prototype instanceof AbstractModel) models.push(v);
    });
  }

  return models;
}

export async function importDatabases(
  paths: string[]
): Promise<Database<any, any>[]> {
  const databases: Database<any, any>[] = [];

  for (const path of paths) {
    const modules = await import(path);

    Object.values(modules).forEach((v: any) => {
      if (v instanceof Database) databases.push(v);
    });
  }

  return databases;
}
