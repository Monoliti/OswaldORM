import fs from "fs";
import { testDb } from "../mock/databases";
import { Book } from "../mock/models";

describe("SQLite Engine", () => {
  beforeAll(async () => {
    await testDb.start();
  });

  beforeEach(async () => {
    Book.objects.flush();
  });

  test("it creates the database file", () => {
    const dbExists = fs.existsSync("./db.sqlite");

    expect(dbExists).toBeTruthy();
    expect(testDb.engine.instance).not.toBeNull();
  });

  test("it creates a table", async () => {
    const tableName = new Book().tableName;

    const tableData = await testDb.engine.instance?.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='${
        new Book().tableName
      }';`
    );

    expect(tableData.name).toBe(tableName);
  });

  test("it creates a model", async () => {
    const book = await Book.objects.create({ name: "test" });
    const sql = `SELECT * FROM ${book.tableName};`;
    const result = await testDb.engine.instance?.get(sql);

    expect(book.name).toBe("test");
    expect(result.id).toBe(1);
    expect(result.name).toBe("test");
  });

  test("it lists models", async () => {
    await Book.objects.create({ name: "test" });
    const books = await Book.objects.list();

    expect(books.length).toBe(1);
  });

  test("it lists models with filter", async () => {
    await Book.objects.create({ name: "test" });
    const book = await Book.objects.create({ name: "Test" });
    const books = await Book.objects.filter({ id: book.id }).list();

    expect(books.length).toBe(1);
    expect(books[0].id).toBe(book.id);
  });

  test("it gets model", async () => {
    const createdBook = await Book.objects.create({ name: "test" });
    const book = await Book.objects.get({ id: createdBook.id });

    expect(book).not.toBeNull();
    expect(book?.id).toBe(createdBook.id);
  });

  test("it lists models with IExact", async () => {
    await Book.objects.create({ name: "test" });
    await Book.objects.create({ name: "Test" });
    const books = await Book.objects.filter({ name__iexact: "test" }).list();

    expect(books.length).toBe(2);
  });

  test("it deletes all models", async () => {
    await Book.objects.create({ name: "test" });
    await Book.objects.delete();
    const books = await Book.objects.list();

    expect(books.length).toBe(0);
  });
});
