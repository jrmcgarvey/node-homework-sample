require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const { xss } = require("express-xss-sanitizer");
const rateLimiter = require("express-rate-limit");
const app = express();

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const authRequired = require("./middleware/auth");
app.use(cookieParser(process.env.JWT_SECRET)); // we don't really need signed cookies
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
app.use(express.json({ limit: "1kb" }));
app.use(xss());

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  }),
);
app.use(helmet());
const port = process.env.PORT || 3000;
const origins = [`http://localhost:${port}`];
if (process.env.ALLOWED_ORIGINS) {
  const originArray = process.env.ALLOWED_ORIGINS.split(",");
  originArray.forEach((orig) => {
    orig = orig.trim();
    if (orig.length > 4) {
      origins.push(orig);
    }
  });
}
app.use(
  cors({
    origin: origins,
    credentials: true,
    methods: "GET,POST,PATCH,DELETE",
    allowedHeaders: "CONTENT-TYPE, X-CSRF-TOKEN",
  }),
);

require("./passport/passport");
const contentChecker = require("./middleware/content-checker");
app.use(contentChecker);
const userRouter = require("./routes/user");
app.use("/user", userRouter);
const taskRouter = require("./routes/task");

app.use("/tasks", authRequired, taskRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

let server = null;
try {
  server = app.listen(port, () =>
    console.log(`Server is listening on port ${port}...`),
  );
} catch (error) {
  console.log(error);
}

module.exports = { app, server };
