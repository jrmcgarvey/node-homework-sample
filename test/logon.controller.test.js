require("dotenv").config("../.env")
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
const { PrismaClient} = require("@prisma/client");
const cookieParser = require("cookie-parser");
const cookieParserMiddleware = cookieParser(process.env.JWT_SECRET);
const {login, register, logoff} = require("../controllers/userController")
const httpMocks = require("node-mocks-http")
require("../csrf/csrf")
const prisma = new PrismaClient();
const cookie = require('cookie');
const signature = require('cookie-signature');
class MockResponseWithCookies {
  constructor(req) {
    this._res = httpMocks.createResponse();
    this.req = req;
    this._res.req = req;
  }

  get response() {
    return this._res;
  }

  cookie(name, value, options = {}) {
    if (options.signed) {
      if (!this.req.secret) {
        throw new Error('Cannot sign cookie; req.secret is missing.');
      }
      value = 's:' + signature.sign(String(value), this.req.secret);
    }

    const serialized = cookie.serialize(name, String(value), options);

    let current = this._res.getHeader('Set-Cookie') || [];
    if (!Array.isArray(current)) {
      current = [current];
    }

    current.push(serialized);
    this._res.setHeader('Set-Cookie', current);
  }
}

beforeAll(async ()=> { // clear database
    await prisma.Task.deleteMany() // delete all tasks
    await prisma.User.deleteMany() // delete all users
})
test("does req.secret get set", async ()=>{
const req = httpMocks.createRequest({
  method: "GET",
});
const res = httpMocks.createResponse();

const middleware = cookieParser("mySuperSecret");

req.headers.cookie = "this=that"
try {
    console.log("got to line 57")
middleware(req, res, () => {
  console.log("after middleware runs, req.secret:", req.secret); // ✅ should log "mySuperSecret"
});} 
catch (e) {
    console.log("error from middleware", e)
}
expect(req.secret).toBeDefined()
})

test("controller test for register", async () => {
    req = httpMocks.createRequest({
        method: "POST",
        body: { email: "bob81@sample.com", name: "Bob", password: "Pa$$word20" },
    })
    res = new MockResponseWithCookies(req)

    //const next = jest.fn()
    console.log("process.env.JWT_SECRET",process.env.JWT_SECRET)
    cookieParserMiddleware(req,res,() => {
        console.log("req.secret 1", req.secret)
    })
    console.log("req.secret", req.secret)
    req.signedCookies={} // workaround for host-csrf bug
    await register(req,res)
    expect(res.statusCode).toBe(201)
    expect(res._isJSON()).toBe(true)
    let data = res._getJSONData()
    expect(data.name).toBe("Bob")
    expect(data.csrfToken).toBeDefined()
    console.log("headers at line 31", res.getHeaders())
    let cookieString = res.get("Set-Cookie")
    console.log("cookieString", cookieString)
    expect(cookieString).toContain("httpOnly: true")
    expect(cookieString).toContain("jwt")
})