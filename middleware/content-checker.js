const { StatusCodes } = require("http-status-codes");

module.exports = (req, res, next) => {
  if (!["POST","PATCH"].includes(req.method))
    return next();
  const contentType = req.get("content-type")
  if (!contentType || contentType != "application/json") 
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Bad Request." });
  next();
};