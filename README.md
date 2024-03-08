# OswaldORM

This project is under construction!

## About

An ORM for Typescript inspired by Django ORM.
It currently only supports SQLite, but other drivers are being developed.

## Installation

No Installation yet

## How to Use

1. Create a database.ts file that will hold all the database connections. (It's also possible to separate into multiple database files: postgres.database.ts, sqlite.database.ts, production.database.ts, test.database.ts, etc...)

#### project/databases.ts

```typescript
import { databases } from "oswaldorm";

export const db = new databases.SQLiteDatabase({
  name: "main",
  path: "./db.sqlite",
});
```

2. Create your models.

#### project/models.ts

```typescript
import { AbstractModel, fields, Manager } from "oswaldorm";
import { db } from "./databases";

export class Book extends AbstractModel {
  tableName: string = "Book";
  db = testDb;
  title = new fields.Character({ maxLength: 200 });

  static get objects() {
    return new Manager(Book);
  }
}
```

3. Make the migrations (or migrate them manually).
   This command will generate .migration.ts files inside a migrations folder.

```
oswald-cli makemigrations .
```

4. Migrate it (or migrate them manually).

```
oswald-cli migrate .
```

3. Query!

#### project/code.ts

```typescript
import { Book } from "./models";

const books = await Book.objects.list(); // List all books
const harryPotterBooks = await Book.objects
  .filter({ title__icontains: "Harry Potter" })
  .list(); // List all books that contains Harry Potter in the title
await Book.objects.filter({ title__icontains: "FNAF" }).delete(); // Deletes all books within a filter
const myNewBook = await Book.objects.create({
  title: "My New Book",
});

console.log(myNewBook.title, myNewBook.id);

myNewBook.title = "Better Title";
myNewBook.save();
```

## TODO

- [ ] Updating entries
- [ ] Foreign Keys
- [ ] Indexing
- [ ] More Filters
- [ ] Ordering
- [ ] Complex Filters
- [ ] Database Functions
- [ ] Migration Dependency
- [ ] PostgreSQL Driver
- [ ] MySQL Driver
- [ ] MSSQL Driver
