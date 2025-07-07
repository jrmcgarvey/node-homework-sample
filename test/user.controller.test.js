require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { createUser } = require("../services/userService");
const httpMocks = require("node-mocks-http");
const { login, register, logoff } = require("../controllers/userController");
require("../passport/passport");

// a few useful globals
let saveRes = null;
let saveData = null;

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
    return new Promise((resolve) => {
      res.oldJsonMethod = res.json;
      res.json = (...args) => {
        res.oldJsonMethod(...args);
        res.json = res.oldJsonMethod;
        resolve();
      };
    });
  };

  return res;
}

beforeAll(async () => {
  // clear database
  const prisma = new PrismaClient();
  await prisma.Task.deleteMany(); // delete all tasks
  await prisma.User.deleteMany(); // delete all users
  await createUser({
    email: "bob@sample.com",
    password: "Pa$$word20",
    name: "Bob",
  });
});
let jwtCookie;

describe("testing login, register, and logoff", () => {
  it("33. The user can be logged on", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: { email: "bob@sample.com", password: "Pa$$word20" },
    });
    saveRes = MockResponseWithCookies();
    const jsonPromise = saveRes.jsonPromise();
    login(req, saveRes); // no need for await here
    await jsonPromise; // because we do it here, to return after the res.json().
    expect(saveRes.statusCode).toBe(200); // success!
  });
  it("35. A string in the Set-Cookie array starts with jwt=.", () => {
    const setCookieArray = saveRes.get("Set-Cookie");
    jwtCookie = setCookieArray.find((str) => str.startsWith("jwt="));
    expect(jwtCookie).toBeDefined();
  });
  it("36. That string contains HttpOnly;.", () => {
    expect(jwtCookie).toContain("HttpOnly");
  });
  it("37. returns the expected name.", () => {
    saveData = saveRes._getJSONData();
    expect(saveData.name).toBe("Bob");
  });
  it("38. returns a csrfToken", () => {
    expect(saveData.csrfToken).toBeDefined();
  });
  it("39. A logon attempt with a bad password returns a 401", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: { email: "bob@sample.com", password: "bad password" },
    });
    saveRes = MockResponseWithCookies();
    const jsonPromise = saveRes.jsonPromise();
    login(req, saveRes);
    await jsonPromise;
    expect(saveRes.statusCode).toBe(401);
  });
  it("40. You can't register with an email address that is already registered.", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: {
        email: "bob@sample.com",
        name: "another Bob",
        password: "Pa$$word20",
      },
    });
    saveRes = MockResponseWithCookies();
    await register(req, saveRes);
    expect(saveRes.statusCode).toBe(400);
  });
  it("41. You can register an additional user.", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: {
        email: "manuel@sample.com",
        name: "Manuel",
        password: "Pa$$word20",
      },
    });
    saveRes = MockResponseWithCookies();
    await register(req, saveRes);
    expect(saveRes.statusCode).toBe(201);
  });
  it("42. You can logon as that new user.", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: { email: "manuel@sample.com", password: "Pa$$word20" },
    });
    saveRes = MockResponseWithCookies();
    const jsonPromise = saveRes.jsonPromise();
    login(req, saveRes);
    await jsonPromise;
    expect(saveRes.statusCode).toBe(200);
  });
  it("43. You can now logoff.", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
    });
    saveRes = MockResponseWithCookies();
    await logoff(req, saveRes);
    expect(saveRes.statusCode).toBe(200);
  });
  it("45. The logoff clears the cookie.", () => {
    const setCookieArray = saveRes.get("Set-Cookie");
    jwtCookie = setCookieArray.find((str) => str.startsWith("jwt="));
    expect(jwtCookie).toContain("Jan 1970");
  });
});
