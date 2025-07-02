require("dotenv").config("../.env");
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
const { PrismaClient } = require("@prisma/client");
require("../passport/passport");
const { login, register, logoff } = require("../controllers/userController");
const httpMocks = require("node-mocks-http");
require("../csrf/csrf");
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
  req.secret = process.env.JWT_SECRET;
  req.signedCookies = {}; //workaround for bug in host-csrf package
  await register(req, res);
  expect(res.statusCode).toBe(201);
  expect(res._isJSON()).toBe(true);
  const data = res._getJSONData();
  expect(data.name).toBe("Bob");
  expect(data.csrfToken).toBeDefined();
  const cookieString = res.get("Set-Cookie");
  expect(cookieString).toEqual(expect.arrayOf(expect.any(String)));
  const jwtCookie = cookieString.find((str) => str.startsWith("jwt="));
  const csrfCookie = cookieString.find((str) => str.startsWith("csrfToken"));
  expect(jwtCookie).toBeDefined();
  expect(jwtCookie).toContain("HttpOnly");
  expect(csrfCookie).toBeDefined();
  expect(csrfCookie).toContain("HttpOnly");
});

test("controller test for logon", async () => {
  let req = httpMocks.createRequest({
    method: "POST",
    body: { email: "bob81@sample.com", password: "Pa$$word20" },
  });
  let res = new MockResponseWithCookies();
  req.secret = process.env.JWT_SECRET;
  req.signedCookies = {}; //workaround for bug in host-csrf package
  const jestfn = jest.fn();
  await login(req, res, jestfn);
  expect(res.statusCode).toBe(200);
  expect(res._isJSON()).toBe(true);
  let data = res._getJSONData();
  expect(data.name).toBe("Bob");
  expect(data.csrfToken).toBeDefined();
  expect(data.csrfToken).toBeDefined();
  let cookieString = res.get("Set-Cookie");
  expect(cookieString).toEqual(expect.arrayOf(expect.any(String)));
  const jwtCookie = cookieString.find((str) => str.startsWith("jwt="));
  const csrfCookie = cookieString.find((str) => str.startsWith("csrfToken="));
  expect(jwtCookie).toBeDefined();
  expect(jwtCookie).toContain("HttpOnly");
  expect(csrfCookie).toBeDefined();
  expect(csrfCookie).toContain("HttpOnly");
  req = httpMocks.createRequest({
    method: "POST",
    body: { email: "bob81@sample.com", password: "bad" },
  });
  res = new MockResponseWithCookies();
  req.secret = process.env.JWT_SECRET;
  req.signedCookies = {}; //workaround for bug in host-csrf package
  await login(req, res, jestfn);
  expect(res.statusCode).toBe(401);
  expect(res._isJSON()).toBe(true);
  cookieString = res.get("Set-Cookie");
  expect(cookieString).toBeUndefined();
  req = httpMocks.createRequest({
    method: "POST",
    body: { email: "bad", password: "bad" },
  });
  res = new MockResponseWithCookies();
  req.secret = process.env.JWT_SECRET;
  req.signedCookies = {}; //workaround for bug in host-csrf package
  await login(req, res, jestfn);
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
