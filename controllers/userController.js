const { userSchema } = require("../validation/userSchema");
const { StatusCodes } = require("http-status-codes");
const { createUser } = require("../services/userService");
const { setJwtCookie } = require("../passport/passport");

const login = async (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: "Login failed" });
    } else {
      setJwtCookie(req, res, user);
      res.json({ name: user.name, csrfToken: req.user.csrfToken });
    }
  })(req, res);
};

const register = async (req, res) => {
  const { error, value } = userSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: error.message });
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
      next(e);
    }
  }
  setJwtCookie(req, res, user);
  return res
    .status(StatusCodes.CREATED)
    .json({ name: value.name, csrfToken: req.user.csrfToken });
};

const logoff = async (req, res) => {
  res.clearCookie("jwt");
  res.sendStatus( StatusCodes.OK );
};

module.exports = { login, register, logoff };
