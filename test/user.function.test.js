const axios = require("axios")
require("dotenv").config("../.env")
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
const { PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();
let jar = null
let client = null
beforeAll(async ()=> { // clear database
  const tough = await import('tough-cookie');
  const { wrapper } = await import('axios-cookiejar-support');
  jar = new tough.CookieJar();
  client = wrapper(axios.create({ jar, baseURL: process.env.TEST_TARGET_URL, withCredentials: true}));
    await prisma.Task.deleteMany() // delete all tasks
    await prisma.User.deleteMany() // delete all users
})

//(async ()=>{






describe('register a user ', () => {
  it('it creates the user entry',  async () => {

    const newUser = {
      name: 'John Deere',
      email: 'jdeere@example.com',
      password: 'Pa$$word20',
    };
    const res = await client
      .post('/user/register', newUser)
    expect(res.status).toBe(201)
    expect(res.data.name).toBe("John Deere")
    expect(res.data.csrfToken).toBeDefined()
    const cookies = jar.getCookiesSync(process.env.TEST_TARGET_URL);
    const jwtCookie = cookies.find((cookie)=> cookie.key === "jwt")
    expect(jwtCookie).toBeDefined()
    expect(jwtCookie.httpOnly).toBe(true)

   
    //   .set('Accept', 'application/json')
    //   .expect('Content-Type', /json/)
    //   .expect(201)
    //   .expect(Cookies.set({name:"csrfToken", options: {httponly: true, secure: true}}))
    //   .expect(Cookies.set({name: "jwt", options: {httponly: true, secure: true}}))
    //   .end((err,res) => {
    //     if (!err) {
    //         expect(res.body.name).toBeDefined()
    //         expect(res.body.CSRFToken).toBeDefined()
    //     }
    //   })
    //   done()
  });
});
//})()