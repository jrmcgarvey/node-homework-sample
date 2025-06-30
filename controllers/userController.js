const passport = require("passport");
const { userSchema } = require("../validation/userSchema");
const jwt = require("jsonwebtoken");
const csrf = require("host-csrf");
const { statusCodes } = require("http-status-codes");

const { createUser } = require("../services/userService");

const setJwtCookie = (res, user) => {
  // Sign JWT
  const payload = { id: user.id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  // Set cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    maxAge: 3600000,
  });
};

const login = async (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user)
      return res
        .status(statusCodes.UNAUTHORIZED)
        .json({ message: "Login failed" });
    setJwtCookie(res, user);
    const csrfToken = csrf.refresh(req, res);
    return res.json({ name: user.name, csrfToken });
  })(req, res, next);
};

const register = async (req, res) => {
  const { err, value } = userSchema.validate(req.body);
  if (err) {
    return res.status(400).res.send({ message: err.message });
  }
  const user = await createUser(value);
  setJwtCookie(res, user);
  const csrfToken = csrf.refresh(req, res);
  return res.status(statusCodes.CREATED).json({ name: value.name, csrfToken });
};

const logoff = async (req, res) => {
  res.clearCookie("jwt");
  res.json({});
};

module.exports = { login, register, logoff };
