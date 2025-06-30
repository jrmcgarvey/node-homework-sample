const passport = require("passport");
const { StatusCodes } = require("http-status-codes");

module.exports = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized" });
    req.user = user;
    next();
  })(req, res, next);
};
