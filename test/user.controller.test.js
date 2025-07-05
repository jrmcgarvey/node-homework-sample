require('dotenv').config({ path: "../.env"});
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
const { PrismaClient } = require("@prisma/client");
require("../passport/passport");
const { login, register, logoff } = require("../controllers/userController");
const httpMocks = require("node-mocks-http");
const prisma = new PrismaClient();
const cookie = require("cookie");
function MockResponseWithCookies() {
  const res = httpMocks.createResponse();
  res.cookie = (name, value, options = {}) => {
    const serialized = cookie.serialize(name, String(value), options);
    let currentHeader = res.getHeader("Set-Cookie");
    if (currentHeader === undefined) {
      currentHeader = [];
    }
    currentHeader.push(serialized);
    res.setHeader("Set-Cookie", currentHeader);
  };

  res.jsonPromise = () => {
    return new Promise(resolve => {
      res.oldJsonMethod = res.json
      res.json = (...args) => {
        res.oldJsonMethod(...args)
        res.json = res.oldJsonMethod
        resolve()
      }
    })
  }

  return res;
}

beforeAll(async () => {
  // clear database
  await prisma.Task.deleteMany(); // delete all tasks
  await prisma.User.deleteMany(); // delete all users
});

test("controller test for register", async () => {
  const req = httpMocks.createRequest({
    method: "POST",
    body: { email: "bob81@sample.com", name: "Bob", password: "Pa$$word20" },
  });
  const res = new MockResponseWithCookies();
  await register(req, res);
  expect(res.statusCode).toBe(201);
  expect(res._isJSON()).toBe(true);
  const data = res._getJSONData();
  expect(data.name).toBe("Bob");
  expect(data.csrfToken).toBeDefined();
  const cookieString = res.get("Set-Cookie");
  expect(cookieString).toEqual(expect.arrayOf(expect.any(String)));
  const jwtCookie = cookieString.find((str) => str.startsWith("jwt="));
  expect(jwtCookie).toBeDefined();
  expect(jwtCookie).toContain("HttpOnly");
});

test("controller test for logon", async () => {
  let req = httpMocks.createRequest({
    method: "POST",
    body: { email: "bob81@sample.com", password: "Pa$$word20" },
  });
  let res = new MockResponseWithCookies();
  let jsonPromise = res.jsonPromise()
  login(req, res);
  await jsonPromise;
  expect(res.statusCode).toBe(200);
  expect(res._isJSON()).toBe(true);
  let data = res._getJSONData();
  expect(data.name).toBe("Bob");
  expect(data.csrfToken).toBeDefined();
  let cookieString = res.get("Set-Cookie");
  expect(cookieString).toEqual(expect.arrayOf(expect.any(String)));
  const jwtCookie = cookieString.find((str) => str.startsWith("jwt="));
  expect(jwtCookie).toBeDefined();
  expect(jwtCookie).toContain("HttpOnly");
  req = httpMocks.createRequest({
    method: "POST",
    body: { email: "bob81@sample.com", password: "bad" },
  });
  res = new MockResponseWithCookies();
  jsonPromise = res.jsonPromise()
  login(req, res);
  await jsonPromise;
  expect(res.statusCode).toBe(401);
  expect(res._isJSON()).toBe(true);
  cookieString = res.get("Set-Cookie");
  expect(cookieString).toBeUndefined();
  req = httpMocks.createRequest({
    method: "POST",
    body: { email: "bad", password: "bad" },
  });
  res = new MockResponseWithCookies();
  jsonPromise = res.jsonPromise()
  login(req, res);
  await jsonPromise;
  expect(res.statusCode).toBe(401);
  expect(res._isJSON()).toBe(true);
  cookieString = res.get("Set-Cookie");
  expect(cookieString).toBeUndefined();
});

test("controller test for logoff", async () => {
  let req = httpMocks.createRequest({
    method: "POST",
    body: { email: "bob81@sample.com", password: "Pa$$word20" },
  });
  let res = new MockResponseWithCookies();
  await logoff(req, res);
  const cookieString = res.get("Set-Cookie");
  expect(cookieString).toEqual(expect.arrayOf(expect.any(String)));
  const jwtCookie = cookieString.find((str) => str.startsWith("jwt="));
  expect(jwtCookie).toBeDefined();
  expect(jwtCookie).toContain("Jan 1970"); // this clears the cookie
});
