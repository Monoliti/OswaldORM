import { AbstractModel, fields, Manager } from "../../src";
import { testDb } from "./databases";

export class Book extends AbstractModel {
  tableName: string = "Book";
  db = testDb;
  name = new fields.Character({ maxLength: 200 });

  static get objects() {
    return new Manager(Book);
  }
}
