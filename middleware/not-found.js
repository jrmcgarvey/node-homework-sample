const { StatusCodes } = require("http-status-codes");
const notFound = (req, res) => {
  console.log(
    "not found",
    req.protocol + "://" + req.get("host") + req.originalUrl,
  );
  res.status(StatusCodes.NOT_FOUND).json({ message: "Route does not exist" });
};
module.exports = notFound;
