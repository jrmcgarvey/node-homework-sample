const { userSchema } = require("../validation/userSchema");
const { StatusCodes } = require("http-status-codes");
const {
  createUser,
  generateUserPassword,
  googleGetAccessToken,
  googleGetUserInfo
} = require("../services/userService");
const { setJwtCookie } = require("../passport/passport");

const prisma = require("../db/prisma");

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

const googleLogon = async (req, res) => {
  try {
    if (!req.body.code) {
      throw new Error("Required body parameter missing: 'code'.");
    }
    const googleAccessToken = await googleGetAccessToken(req.body.code);
    const googleUserInfo = await googleGetUserInfo(googleAccessToken);

    if (!googleUserInfo.email || !googleUserInfo.isEmailVerified) {
      throw new Error("The email is either missing or not verified.");
    }
    if (!googleUserInfo.name) {
      throw new Error("The name is missing.");
    }

    let user = await prisma.user.findFirst({ where: { email: {
      equals: googleUserInfo.email, mode: "insensitive"
    }}});

    if (!user) {
      const randomPassword = generateUserPassword();
      // TODO: notify user with generated password
      console.log(`Creating user with password: ${randomPassword}`);
      user = await createUser({
        name: googleUserInfo.name,
        email: googleUserInfo.email,
        password: randomPassword
      });
    }
    setJwtCookie(req, res, user);
    return res.json({ name: user.name, csrfToken: req.user.csrfToken });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Google auth error: " + error?.message
    });
  }
};

const register = async (req, res) => {
  if (!req.body) req.body = {};
  const { error, value } = userSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
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
  return res
    .status(StatusCodes.CREATED)
    .json({ name: value.name, csrfToken: req.user.csrfToken });
};

const logoff = async (req, res) => {
  res.clearCookie("jwt");
  res.sendStatus(StatusCodes.OK);
};

module.exports = { login, googleLogon, register, logoff };
