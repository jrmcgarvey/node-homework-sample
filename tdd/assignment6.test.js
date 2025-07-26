require("dotenv").config();
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
const prisma = require("../db/prisma");
const httpMocks = require("node-mocks-http");
const {
  index,
  show,
  create,
  update,
  deleteTask,
} = require("../controllers/taskController");
const { login, register, logoff } = require("../controllers/userController");

// a few useful globals
let user1 = null;
let user2 = null;
let saveRes = null;
let saveData = null;
let saveTaskId = null;

const { getLoggedOnUser } = require("../util/memoryStore.js")

beforeAll(async () => {
  await prisma.Task.deleteMany(); // delete all tasks
  await prisma.User.deleteMany(); // delete all users
});

afterAll(() => {
  prisma.$disconnect();
});

describe("testing login, register, and logoff", () => {
  it("You can register a user.", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: {
        email: "jim@sample.com",
        name: "Jim",
        password: "Pa$$word20",
      },
    });
    saveRes = httpMocks.createResponse();
    await register(req, saveRes);
    expect(saveRes.statusCode).toBe(201);
    user1 = getLoggedOnUser();
  });
  it("The user can be logged on", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: { email: "jim@sample.com", password: "Pa$$word20" },
    });
    saveRes = httpMocks.createResponse();
    await login(req, saveRes);  
    expect(saveRes.statusCode).toBe(200); // success!
  });

  it("returns the expected name.", () => {
    saveData = saveRes._getJSONData();
    expect(saveData.name).toBe("Jim");
  });
  it("A logon attempt with a bad password returns a 401", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: { email: "jim@sample.com", password: "bad password" },
    });
    saveRes = httpMocks.createResponse();
    await login(req, saveRes);
    expect(saveRes.statusCode).toBe(401);
  });
  it("You can register an additional user.", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: {
        email: "manuel@sample.com",
        name: "Manuel",
        password: "Pa$$word20",
      },
    });
    saveRes = httpMocks.createResponse();
    await register(req, saveRes);
    expect(saveRes.statusCode).toBe(201);
    user2 = getLoggedOnUser();
  });
  it("You can logon as that new user.", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: { email: "manuel@sample.com", password: "Pa$$word20" },
    });
    saveRes = httpMocks.createResponse();
    await login(req, saveRes);
    expect(saveRes.statusCode).toBe(200);
  });
  it("You can now logoff.", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
    });
    saveRes = httpMocks.createResponse();
    await logoff(req, saveRes);
    expect(saveRes.statusCode).toBe(200);
  });
});

describe("testing task creation", () => {
  it("If you have a valid user id, create() succeeds (res.statusCode should be 201).", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: { title: "first task" },
    });
    req.user = { id: user1 };
    saveRes = httpMocks.createResponse();
    await create(req, saveRes);
    expect(saveRes.statusCode).toBe(201);
  });
  it("The object returned from the create() call has the expected title.", () => {
    saveData = saveRes._getJSONData();
    saveTaskId = saveData.id.toString();
    expect(saveData.title).toBe("first task");
  });
  it("The object has the right value for isCompleted.", () => {
    expect(saveData.isCompleted).toBe(false);
  });
  it("The object does not have any value for userId.", () => {
    expect(saveData.userId).not.toBeDefined();
  });
});

describe("getting created tasks", () => {
  it("If you use user1's id, index returns a 200 statusCode.", async () => {
    const req = httpMocks.createRequest({
      method: "GET",
    });
    req.user = { id: user1 };
    saveRes = httpMocks.createResponse();
    await index(req, saveRes);
    expect(saveRes.statusCode).toBe(200);
  });
  it("The returned JSON array has length 1.", () => {
    saveData = saveRes._getJSONData();
    expect(saveData).toHaveLength(1);
  });
  it("The title in the first array object is as expected.", () => {
    expect(saveData[0].title).toBe("first task");
  });
  it("The first array object does not contain a userId.", () => {
    expect(saveData[0].userId).not.toBeDefined();
  });
  it("If get the list of tasks using the userId from user2, you get a 404.", async () => {
    const req = httpMocks.createRequest({
      method: "GET",
    });
    req.user = { id: user2 };
    saveRes = httpMocks.createResponse();
    await index(req, saveRes);
    expect(saveRes.statusCode).toBe(404);
  });
  it("You can retrieve the first array object using the `show()` method of the controller.", async () => {
    const req = httpMocks.createRequest({
      method: "GET",
    });
    req.user = { id: user1 };
    req.params = { id: saveTaskId };
    saveRes = httpMocks.createResponse();
    await show(req, saveRes);
    expect(saveRes.statusCode).toBe(200);
  });
});

describe("testing the update and delete of tasks.", () => {
  it("User1 can set the task to isCompleted: true.", async () => {
    const req = httpMocks.createRequest({
      method: "PATCH",
    });
    req.user = { id: user1 };
    req.params = { id: saveTaskId };
    req.body = { isCompleted: true };
    saveRes = httpMocks.createResponse();
    await update(req, saveRes);
    expect(saveRes.statusCode).toBe(200);
  });
  it("User2 can't do this.", async () => {
    const req = httpMocks.createRequest({
      method: "PATCH",
    });
    req.user = { id: user2 };
    req.params = { id: saveTaskId };
    req.body = { isCompleted: true };
    saveRes = httpMocks.createResponse();
    await update(req, saveRes);
    expect(saveRes.statusCode).not.toBe(200);
  });
    it("User2 can't delete this task.", async () => {
    const req = httpMocks.createRequest({
      method: "DELETE",
    });
    req.user = { id: user2 };
    req.params = { id: saveTaskId };
    saveRes = httpMocks.createResponse();
    await deleteTask(req, saveRes);
    expect(saveRes.statusCode).not.toBe(200);
  });
  it("User1 can delete this task.", async () => {
    const req = httpMocks.createRequest({
      method: "DELETE",
    });
    req.user = { id: user1 };
    req.params = { id: saveTaskId };
    saveRes = httpMocks.createResponse();
    await deleteTask(req, saveRes);
    expect(saveRes.statusCode).toBe(200);
  });
  it("Retrieving user1's tasks now returns a 404.", async () => {
    const req = httpMocks.createRequest({
      method: "GET",
    });
    req.user = { id: user1 };
    saveRes = httpMocks.createResponse();
    await index(req, saveRes);
    expect(saveRes.statusCode).toBe(404);
  });
});

let userSchema= null;
let taskSchema= null;
let patchTaskSchema = null;
try {
userSchema  = require("../validation/userSchema").userSchema;
({ taskSchema, patchTaskSchema } = require("../validation/taskSchema"));
} catch {
    // these won't be built at the start, but we want the test to proceed
}
it("finds the user and task schemas", ()=>{
    expect(userSchema).toBeDefined();
    expect(taskSchema).toBeDefined();
})
if (userSchema) {
describe("user object validation tests", () => {
  it("doesn't permit a trivial password", () => {
    const { error } = userSchema.validate(
      { name: "Bob", email: "bob@sample.com", password: "password" },
      { abortEarly: false },
    );
    expect(
      error.details.find((detail) => detail.context.key == "password"),
    ).toBeDefined();
  });
  it("The user schema requires that an email be specified.", () => {
    const { error } = userSchema.validate(
      { name: "Bob", password: "Pa$$word20" },
      { abortEarly: false },
    );
    expect(
      error.details.find((detail) => detail.context.key == "email"),
    ).toBeDefined();
  });
  it("The user schema does not accept an invalid email.", () => {
    const { error } = userSchema.validate(
      { name: "Bob", email: "bob_at_sample.com", password: "Pa$$word20" },
      { abortEarly: false },
    );
    expect(
      error.details.find((detail) => detail.context.key == "email"),
    ).toBeDefined();
  });
  it("The user schema requires a password.", () => {
    const { error } = userSchema.validate(
      { name: "Bob", email: "bob@sample.com" },
      { abortEarly: false },
    );
    expect(
      error.details.find((detail) => detail.context.key == "password"),
    ).toBeDefined();
  });
  it("The user schema requires name.", () => {
    const { error } = userSchema.validate(
      {
        email: "bob@sample.com",
        password: "Pa$$word20",
      },
      { abortEarly: false },
    );
    expect(
      error.details.find((detail) => detail.context.key == "name"),
    ).toBeDefined();
  });
  it("The name must be valid (3 to 30 characters).", () => {
    const { error } = userSchema.validate(
      { name: "B", email: "bob@sample.com", password: "Pa$$word20" },
      { abortEarly: false },
    );
    expect(
      error.details.find((detail) => detail.context.key == "name"),
    ).toBeDefined();
  });
  it("If validation is performed on a valid user object, error comes back falsy.", () => {
    const { error } = userSchema.validate(
      { name: "Bob", email: "bob@sample.com", password: "Pa$$word20" },
      { abortEarly: false },
    );
    expect(error).toBeFalsy();
  });
});
}
if (taskSchema) {
describe("task object validation test", () => {
  it("The task schema requires a title.", () => {
    const { error } = taskSchema.validate({ isCompleted: true });
    expect(
      error.details.find((detail) => detail.context.key == "title"),
    ).toBeDefined();
  });
  it("If an isCompleted value is specified, it must be valid.", () => {
    const { error } = taskSchema.validate({
      title: "first task",
      isCompleted: "baloney",
    });
    expect(
      error.details.find((detail) => detail.context.key == "isCompleted"),
    ).toBeDefined();
  });
  it("If an isCompleted value is not specified but the rest of the object is valid, a default of false is provided by validation", () => {
    const { value } = taskSchema.validate({ title: "first task" });
    expect(value.isCompleted).toBe(false);
  });
  it("If `isCompleted` in the provided object has the value `true`, it remains `true` after validation.", () => {});
});

describe("patchTask object validation test", () => {
  it("Test that the title is not required in this case.", () => {
    const { error } = patchTaskSchema.validate({ isCompleted: true });
    expect(error).toBeFalsy();
  });
  it("Test that if no value is provided for `isCompleted`, that this remains undefined in the returned value.", () => {
    const { value } = patchTaskSchema.validate({ title: "first task" });
    expect(value.isCompleted).toBeUndefined();
  });
});
}