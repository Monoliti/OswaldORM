import {
  Database,
  DatabaseEngine,
  DatabaseField,
  DatabaseProps,
  TableCreationData,
} from "../core/database";
import sqlite3 from "sqlite3";
import { open, Database as SQLiteDB } from "sqlite";
import {
  Field,
  FieldConstraint,
  FieldConstraintValueTuple,
  FieldType,
  NameFieldTuple,
} from "../core/fields";
import { AbstractModel } from "../core/model";
import { QueryFilter, QueryFilterFieldValue, QuerySet } from "../core/query";

interface SQLiteProps extends DatabaseProps {
  path: string;
}

export class SQLiteEngine extends DatabaseEngine<SQLiteProps, SQLiteDB> {
  constructor(props: SQLiteProps) {
    super(props);
  }

  async start(): Promise<SQLiteDB> {
    return await open({
      filename: "./db.sqlite",
      driver: sqlite3.Database,
    });
  }

  async createTable(data: TableCreationData): Promise<string> {
    const fields = data.fields
      .map((f) => `${f.name} ${f.type} ${f.constraints}`)
      .join(", ");
    const sql = `CREATE TABLE IF NOT EXISTS ${data.name} (${fields});`;

    console.log(sql);

    await this.instance?.exec(sql);

    return sql;
  }

  async listEntries<T extends AbstractModel>(
    queryset: QuerySet<T>
  ): Promise<T[]> {
    const fields = this.queryToFieldString(queryset);
    const filters = this.queryToFilterString(queryset);
    let sql = `SELECT ${fields} FROM ${queryset.model.tableName}`;

    if (queryset.filters.length > 0) {
      sql += " WHERE " + filters;
    }

    console.log(sql);

    const result = await this.instance?.all(sql);

    if (!result) return [];
    if (!Array.isArray(result)) return [result];
    return result;
  }

  async deleteEntries<T extends AbstractModel>(
    queryset: QuerySet<T>
  ): Promise<void> {
    const filters = this.queryToFilterString(queryset);
    let sql = `DELETE FROM ${queryset.model.tableName}`;

    if (queryset.filters.length > 0) {
      sql += ` WHERE ${filters};`;
    }

    console.log(sql);

    await this.instance?.exec(sql);
  }

  async insertEntries(
    table: string,
    entries: NameFieldTuple[][]
  ): Promise<number | string | undefined> {
    if (entries.length === 0) return;

    const insertableFields = entries[0]
      .filter(([_, f]) => !f.constraints.primaryKey)
      .map(([k, _]) => k)
      .join(",");
    const valuesToInsert = entries
      .map(
        (fields) =>
          "(" +
          fields
            .filter(([_, f]) => !f.constraints.primaryKey)
            .map(([_, f]) => f.toSQL())
            .join(",") +
          ")"
      )
      .join(",");

    const sql = `INSERT INTO ${table} (${insertableFields}) VALUES ${valuesToInsert};`;

    console.log(sql);

    const result = await this.instance?.run(sql);

    return result?.lastID;
  }

  async resetPrimarySequence(table: string): Promise<void> {
    await this.instance?.exec(
      `UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME='${table}'`
    );
  }

  queryFilterToString([filter, field, value]: QueryFilterFieldValue): string {
    switch (filter) {
      default:
      case QueryFilter.Exact:
        return `${field}=${value}`;

      case QueryFilter.IExact:
        return `${field} = ${value} COLLATE NOCASE`;
    }
  }

  queryToFilterString(queryset: QuerySet<any>) {
    return queryset.filters
      .map((f) => this.queryFilterToString(f))
      .join(" AND ");
  }

  queryToFieldString<T extends AbstractModel>(queryset: QuerySet<T>) {
    return queryset.model
      .getFields()
      .map(([k, _]) => k)
      .join(", ");
  }

  fieldConstraintToString([field, value]: FieldConstraintValueTuple): string {
    switch (field) {
      case FieldConstraint.PrimaryKey:
        return "PRIMARY KEY";

      case FieldConstraint.Default:
        return "DEFAULT " + value;

      case FieldConstraint.Null:
        if (value === false) return "NOT NULL";

      case FieldConstraint.Unique:
        return "UNIQUE";

      case FieldConstraint.AutoIncrement:
        return "AUTOINCREMENT";

      default:
        return "";
    }
  }

  fieldToDatabaseField(
    name: string,
    field: Field,
    constraints: FieldConstraintValueTuple[]
  ): DatabaseField {
    const result = {
      name: name,
      type: "",
      constraints: constraints
        .map((c) => this.fieldConstraintToString(c))
        .filter((c) => c)
        .join(" "),
    };

    switch (field.type) {
      case FieldType.Number:
        result.type = "INTEGER";
        break;

      default:
      case FieldType.Text:
      case FieldType.Character:
        result.type = "TEXT";
        break;
    }

    return result as DatabaseField;
  }
}

export class SQLiteDatabase extends Database<SQLiteProps, SQLiteDB> {
  constructor(props: SQLiteProps) {
    super(props.name, new SQLiteEngine(props));
  }
}
