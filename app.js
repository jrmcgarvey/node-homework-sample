require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const authRequired = require("./middleware/auth");
app.use(cookieParser(process.env.JWT_SECRET));
const csrfMiddleware = require("./csrf/csrf");
app.use(express.json());
// extra packages

require("./passport/passport");

const userRouter = require("./routes/user");
app.use("/user", userRouter);
const taskRouter = require("./routes/task");
app.use("/tasks", csrfMiddleware, authRequired, taskRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`),
    );
  } catch (error) {
    console.log(error);
  }
};

start();
module.exports = app;
