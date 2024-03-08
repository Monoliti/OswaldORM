import { AbstractModel } from "./model";

export interface QuerySetMethods<T extends AbstractModel> {
  filter(filters: Record<string, any>): QuerySet<T>;
  list(): Promise<T[]>;
  delete(): void;
}

export enum QueryFilter {
  Exact = "__exact",
  IExact = "__iexact",
}

export type QueryFilterFieldValue = [QueryFilter, string, any];

export class QuerySet<T extends AbstractModel> implements QuerySetMethods<T> {
  length?: number;
  model: T;
  filters: QueryFilterFieldValue[] = [];

  constructor(model: T) {
    this.model = model;
  }

  private parseFilterRecord(
    filters: Record<string, any>
  ): QueryFilterFieldValue[] {
    return Object.entries(filters).map(([k, v]) => {
      const filter = Object.values(QueryFilter).filter((f) => k.includes(f));

      if (filter.length === 0)
        return [QueryFilter.Exact, k, v] as QueryFilterFieldValue;

      return [
        filter[0],
        k.replace(filter[0], ""),
        JSON.stringify(v),
      ] as QueryFilterFieldValue;
    });
  }

  filter(filters: Record<string, any>): QuerySet<T> {
    this.filters = [...this.filters, ...this.parseFilterRecord(filters)];

    return this;
  }

  async list() {
    return await this.model.db.engine.listEntries(this);
  }

  async delete() {
    return await this.model.db.engine.deleteEntries(this);
  }
}
