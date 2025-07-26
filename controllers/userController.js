const { userSchema } = require("../validation/userSchema");
const { StatusCodes } = require("http-status-codes");
const { createUser, verifyUserPassword } = require("../services/userService");
const { setJwtCookie } = require("../passport/passport");
const { setLoggedOnUser } = require("../util/memoryStore")

const login = async (req, res) => {
  const { user, isValid } = await verifyUserPassword(req.body.email, req.body.password);
  if (isValid) {
    setLoggedOnUser(user.id)
    return res.json({name: user.name});
  }
  res.status(401).json({message: "Authentication failed."})
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
  // setJwtCookie(req, res, user);
  // return res
  //   .status(StatusCodes.CREATED)
  //   .json({ name: value.name, csrfToken: req.user.csrfToken });
  setLoggedOnUser(user.id);
  res.status(StatusCodes.CREATED).json( {name: user.name } );
};

const logoff = async (req, res) => {
  // res.clearCookie("jwt");
  setLoggedOnUser(null);
  res.sendStatus( StatusCodes.OK );
};

module.exports = { login, register, logoff };
