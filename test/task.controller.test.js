require("dotenv").config("../.env");
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
const { PrismaClient } = require("@prisma/client");
const { createUser } = require("../services/userService");
const httpMocks = require("node-mocks-http");
const {
  index,
  show,
  create,
  update,
  deleteTask,
} = require("../controllers/taskController");
const prisma = new PrismaClient();
let user = null;

beforeAll(async () => {
  // clear database
  await prisma.Task.deleteMany(); // delete all tasks
  await prisma.User.deleteMany(); // delete all users
  user = await createUser({
    email: "bob@sample.com",
    password: "Pa$$word20",
    name: "Bob",
  });
});

test("test task create", async () => {
  let req = httpMocks.createRequest({
    method: "POST",
    body: { title: "first task" },
  });
  req.user = { id: user.id };
  let res = httpMocks.createResponse();
  await create(req, res);
  expect(res.statusCode).toBe(201);
});
