import { Database } from "./database";
import { AbstractField, Field, NameFieldTuple, fields } from "./fields";
import { QuerySet, QuerySetMethods } from "./query";

export interface Model {
  id: Field | number | string;
  getFields(): [name: string, field: Field][];
  tableName: string;
  [k: string]: any;
}

export class Manager<T extends AbstractModel> implements QuerySetMethods<T> {
  private cls: new () => T;

  constructor(cls: new () => T) {
    this.cls = cls;
  }

  private toEntry(instance: AbstractModel, data: Record<string, any>) {
    instance.getFields().forEach(([k, v]) => {
      instance["__" + k] = v;
      instance[k] = data[k];
    });
  }

  async create(data: Record<string, any>) {
    const instance: T = new this.cls();

    this.toEntry(instance, data);
    await instance.save();

    return instance;
  }

  filter(filters: Record<string, any>): QuerySet<T> {
    return new QuerySet(new this.cls()).filter(filters);
  }

  delete(): void {
    new QuerySet(new this.cls()).delete();
  }

  flush(): void {
    const instance = new this.cls();
    this.delete();
    instance.db.engine.resetPrimarySequence(instance.tableName);
  }

  async list() {
    return new QuerySet(new this.cls()).list();
  }

  async get(filters: Record<string, any>): Promise<T | null> {
    const result = await this.filter(filters).list();

    if (result.length === 0) return null;

    return result[0];
  }
}

export abstract class AbstractModel implements Model {
  [k: string]: any;
  id: any = new fields.Number({ primaryKey: true, autoIncrement: true });
  abstract db: Database<any, any>;
  abstract tableName: string;

  getFields(): NameFieldTuple[] {
    return Object.entries(this)
      .filter(([_, f]) => f instanceof AbstractField)
      .map(([k, f]) => [k.replace("__", ""), f]);
  }

  private updateFields() {
    this.getFields().forEach(([k, v]) => {
      const field: Field = this["__" + k];
      field.value = this[k];
    });
  }

  async create() {
    const id = await this.db.insertModel(this);
    this.id = id as number;
  }

  async save() {
    this.updateFields();

    if (!this.id) await this.create();
  }
}
