import fs from "fs";
import { AbstractModel } from "../core/model";
import { Field } from "../core/fields";

export function createMigrationFolder(path: string) {
  const dir = path + "/migrations";

  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
}

function makeFieldMigration(field: Field) {
  return `fields.${field.constructor.name}(${JSON.stringify(
    field.constraints
  )})`;
}

function makeCreateTableMigration(model: new () => AbstractModel) {
  const instance = new model();
  return `migrations.createTable({
            name:"${instance.tableName}",
            database:"${instance.db.name}",
            fields:{
                ${instance
                  .getFields()
                  .map(([n, f]) => `${n}: new ${makeFieldMigration(f)}`)
                  .join(",\n\t\t\t\t")}
            }
        })
`;
}

export function makeMigration(
  path: string,
  models: (new () => AbstractModel)[]
) {
  const migrationNumber = 1;
  const now = new Date();
  const fileName = migrationNumber.toString() + ".migration.ts";
  const file = `import {migrations, fields} from "oswaldorm"\n
migrations.migration({
    name: "${migrationNumber}-${now.toISOString()}",
    operations:[
        ${models.map((m) => makeCreateTableMigration(m)).join(",\n\t")}
    ]
})
`;

  fs.writeFileSync(path + "/" + fileName, file);
}
