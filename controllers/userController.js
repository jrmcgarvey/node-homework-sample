const passport = require("passport");
const { userSchema } = require("../validation/userSchema");
const jwt = require("jsonwebtoken");
const { refreshToken } = require("host-csrf");
const { StatusCodes } = require("http-status-codes");
const { randomUUID } = require("crypto");


const { createUser } = require("../services/userService");

const setJwtCookie = (req, res, user) => {
  // Sign JWT
  const payload = { id: user.id, csrfToken:  randomUUID()};
  req.user = payload
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  const sameSite = (process.env.NODE_ENV === "production") ? "None" : "Strict"

  // Set cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite,
    maxAge: 3600000,
  });
};

const login = async (req, res) => {
  const loginPromise = new Promise((resolve, reject) => {
    // this promise is needed to enable testing.  The test must see the result
    // after the callback from passport.authenticate().
    passport.authenticate("local", { session: false }, (err, user) => {
      if (err) return reject(err);
      if (!user) {
        res.status(StatusCodes.UNAUTHORIZED).json({ message: "Login failed" });
      } else {
        setJwtCookie(req, res, user);
        res.json({ name: user.name, csrfToken: req.user.csrfToken });
      }
      resolve();
    })(req, res);
  });
  await loginPromise;
};

const register = async (req, res) => {
  const { err, value } = userSchema.validate(req.body, { abortEarly: false });
  if (err) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .res.json({ message: err.message });
  }
  let user = null;
  try {
    user = await createUser(value);
  } catch (e) {
    if (e.name === "PrismaClientKnownRequestError" && e.code == "P2002") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "A user record already exists with that email." });
    } else {
      throw e;
    }
  }
  setJwtCookie(req, res, user);
  return res.status(StatusCodes.CREATED).json({ name: value.name, csrfToken: req.user.csrfToken });
};

const logoff = async (req, res) => {
  res.clearCookie("jwt");
  res.json({});
};

module.exports = { login, register, logoff };
