const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

module.exports = async (req, res, next) => {
  const token = req?.cookies?.jwt;
  if (token) {
    jwt.verify(token, (err, decoded) => {
      if (!err) {
        req.user.id = decoded.id;
        if (
          ["POST", "PATCH", "PUT", "DELETE", "CONNECT"].includes(req.method)
        ) {
          // for these operations we have to check for cross site request forgery
          if (req.get("X-CSRF-TOKEN") == decoded.csrfToken) {
            next();
          }
        } else {
          next();
        }
      }
    });
  }
  res
    .status(StatusCodes.UNAUTHORIZED)
    .json({ message: "No user is authenticated." });
};
