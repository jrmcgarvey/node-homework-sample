const { StatusCodes } = require("http-status-codes");
const errorHandlerMiddleware = (err, req, res) => {
  console.log("Internal server error", err);
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ message: err.message });
};

module.exports = errorHandlerMiddleware;
