require("dotenv").config({path: "../.env"});
const request = require("supertest")
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
const {app, server} = require("../app")
const agent = request.agent(app)
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

beforeAll(async () => {
  // clear databaseS
  await prisma.Task.deleteMany(); // delete all tasks
  await prisma.User.deleteMany(); // delete all users
});

describe("register a user ", () => {
  it("it creates the user entry", async () => {
    const newUser = {
      name: "John Deere",
      email: "jdeere@example.com",
      password: "Pa$$word20",
    };
    const res = await agent.post("/user/register", newUser).send(newUser);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("John Deere");
    expect(res.body.csrfToken).toBeDefined();
    console.log(res.headers)
    expect(res.headers["set-cookie"]).toBeDefined();
    const cookie = res.headers["set-cookie"][0]
    console.log(cookie)
    expect(cookie.substring(0,4)).toBe("jwt=")
    expect(cookie).toContain("HttpOnly;")
  });
});
