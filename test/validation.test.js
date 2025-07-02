const { userSchema } = require("../validation/userSchema");
const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");

test("user object validation", () => {
  let { error, value } = userSchema.validate(
    { name: "a", email: "b", password: "c" },
    { abortEarly: false },
  );
  expect(error).toBeDefined();
  expect(
    error.details.find((detail) => detail.context.key == "name"),
  ).toBeDefined();
  expect(
    error.details.find((detail) => detail.context.key == "email"),
  ).toBeDefined();
  expect(
    error.details.find((detail) => detail.context.key == "password"),
  ).toBeDefined();
  ({ error, value } = userSchema.validate({
    name: "  Bob  ",
    email: "bob@sample.com",
    password: "Pa$$word20",
  }));
  expect(error).toBeUndefined();
  expect(value.name).toBe("Bob");
});

test("task object validation", () => {
  let { error, value } = taskSchema.validate(
    { title: 7, isCompleted: "baloney" },
    { abortEarly: false },
  );
  expect(error).toBeDefined();
  expect(
    error.details.find((detail) => detail.context.key == "title"),
  ).toBeDefined();
  expect(
    error.details.find((detail) => detail.context.key == "isCompleted"),
  ).toBeDefined();
  ({ error, value } = taskSchema.validate({ title: " this title " }));
  expect(error).toBeUndefined();
  expect(value.title).toBe("this title");
  expect(value.isCompleted).toBe(false);
  ({ error } = patchTaskSchema.validate({ isCompleted: "baloney" }));
  expect(error).toBeDefined();
  ({ error, value } = patchTaskSchema.validate({ isCompleted: true }));
  expect(error).toBeUndefined();
  expect(value.isCompleted).toBe(true);
});
