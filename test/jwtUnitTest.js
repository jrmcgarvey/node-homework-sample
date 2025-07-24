const jwt = require("jsonwebtoken");
const passport = require("passport");
require ("../passport/passport");

let token = jwt.sign(
  { name: "Frank", email: "frank@sample.com" },
    process.env.JWT_SECRET,
  { expiresIn: "1h" },
);
const req = { cookies: { jwt: token } };
const reportPassportResult = (err, user) => {
  if (err) {
    return console.log("An error happened on authentication:", err.message);
  }
  if (user) {
    return console.log("Authentication succeeded, and the user information is:", JSON.stringify(user));
  }
  console.log("Authentication Failed" )
};
const passportJWTMiddleware = passport.authenticate("jwt", reportPassportResult)
passportJWTMiddleware(req, {});