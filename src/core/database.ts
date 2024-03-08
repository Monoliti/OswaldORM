import { Field, FieldConstraintValueTuple, NameFieldTuple } from "./fields";
import { AbstractModel, Model } from "./model";
import { QueryFilterFieldValue, QuerySet } from "./query";

export interface DatabaseField {
  name: string;
  type: string;
  constraints: string;
}

export interface DatabaseIndex {
  field: string;
}

export interface TableCreationData {
  name: string;
  fields: DatabaseField[];
  indexes?: DatabaseIndex[];
}

export interface DatabaseProps {
  name: string;
}

export abstract class DatabaseEngine<T, Y> {
  protected props: T;
  instance?: Y;

  constructor(props: T) {
    this.props = props;
  }

  abstract start(): Y | Promise<Y>;

  abstract createTable(data: TableCreationData): Promise<string>;
  abstract deleteEntries<T extends AbstractModel>(queryset: QuerySet<T>): void;
  abstract insertEntries(
    table: string,
    entries: NameFieldTuple[][]
  ): Promise<undefined | string | number>;
  abstract listEntries<T extends AbstractModel>(
    queryset: QuerySet<T>
  ): T[] | Promise<T[]>;
  abstract resetPrimarySequence(table: string): void;

  abstract fieldToDatabaseField(
    name: string,
    field: Field,
    constraints: FieldConstraintValueTuple[]
  ): DatabaseField;
  abstract fieldConstraintToString(
    fieldConstraint: FieldConstraintValueTuple
  ): string;
  abstract queryFilterToString(filterData: QueryFilterFieldValue): string;
}

export abstract class Database<T, Y> {
  name: string;
  engine: DatabaseEngine<T, Y>;

  constructor(name: string, engine: DatabaseEngine<T, Y>) {
    this.engine = engine;
    this.name = name;
  }

  async start() {
    this.engine.instance = await this.engine.start();
  }

  async insertModel(
    model: AbstractModel
  ): Promise<number | undefined | string> {
    return await this.engine.insertEntries(model.tableName, [
      model.getFields(),
    ]);
  }
}
