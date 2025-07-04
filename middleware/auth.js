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
        if (["POST","PATCH","PUT","DELETE","CONNECT"].includes(req.method)) {
        if (req.get("X-CSRF-TOKEN") != req.user.csrfToken)
                return res
                  .status(StatusCodes.BAD_REQUEST)
                  .json({ message: "Bad Request." });
    }
    next();
  })(req, res, next);
};
