import { Book } from "../mock/models";

describe("Model Class", () => {
  test("it lists the fields", () => {
    const fields = new Book().getFields();

    expect(fields.length).toBe(2);
  });
});
