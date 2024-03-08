export enum FieldType {
  Character,
  Number,
  Text,
}

export enum FieldConstraint {
  Null = "null",
  Blank = "blank",
  PrimaryKey = "primaryKey",
  MaxLength = "maxLength",
  Default = "default",
  Unique = "unique",
  AutoIncrement = "autoIncrement",
}

export type NameFieldTuple = [string, Field];

export type FieldConstraintValueTuple = [FieldConstraint, any];

export interface DefaultFieldConstraint<T> {
  [FieldConstraint.Null]?: boolean;
  [FieldConstraint.Blank]?: boolean;
  [FieldConstraint.PrimaryKey]?: boolean;
  [FieldConstraint.Default]?: T;
  [FieldConstraint.Unique]?: boolean;
  [FieldConstraint.AutoIncrement]?: boolean;
}

export interface Field {
  type: FieldType;
  value?: any;
  constraints: Record<FieldConstraint, any>;
  constraintsList: FieldConstraintValueTuple[];
  toSQL: () => any;
}

export abstract class AbstractField<T> implements Field {
  abstract type: FieldType;
  value: any = undefined;
  constraints: Record<FieldConstraint, any>;
  constraintsList: FieldConstraintValueTuple[];

  constructor(constraints: T) {
    this.constraints = {
      ...{ null: false, blank: false },
      ...(constraints as Record<FieldConstraint, any>),
    };
    this.constraintsList = Object.entries(
      this.constraints
    ) as FieldConstraintValueTuple[];
  }

  get(){
    return this.value;
  }

  set(value: any){
    this.value = value;
  }

  toSQL(){
    return this.value;
  }
}

export interface CharacterFieldConstraint
  extends DefaultFieldConstraint<string> {
  [FieldConstraint.MaxLength]: number;
}

class Character extends AbstractField<CharacterFieldConstraint> {
  type = FieldType.Character;

  toSQL(){
    return `"${this.value}"`
  }
}

class Number extends AbstractField<DefaultFieldConstraint<number>> {
  type = FieldType.Number;
}

class Text extends AbstractField<DefaultFieldConstraint<string>> {
  type = FieldType.Text;

  toSQL(){
    return `"${this.value}"`
  }
}

export const fields = {
  Character,
  Number,
  Text,
};
