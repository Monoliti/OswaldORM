import { databases } from "../../src";

export const testDb = new databases.SQLiteDatabase({
  name: "testDb",
  path: "./db.sqlite",
});
