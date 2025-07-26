const { StatusCodes } = require("http-status-codes");
const { getLoggedOnUser } = require("../util/memoryStore");

module.exports = (req, res, next) => {
  const loggedOnUser = getLoggedOnUser()
  if (!loggedOnUser)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized." });
  req.user = { id: loggedOnUser };
  next();
};
