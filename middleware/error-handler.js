const { StatusCodes } = require("http-status-codes");
const errorHandlerMiddleware = (err, req, res, next) => {
  if (err.constructor.name === "CSRFError") {
    console.log("CSRF token validation failed.");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "CSRF token validation failed."})
  }
  console.log("Internal server error", err.constructor.name, JSON.stringify(err, ["name","message","stack"]));
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ message: "An internal server error occured." });
};

module.exports = errorHandlerMiddleware;
