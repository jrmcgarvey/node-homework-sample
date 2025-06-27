const csrf = require("host-csrf");
const app = require("../app");
let csrf_development_mode = true;
if (process.env.NODE_ENV === "production") {
  csrf_development_mode = false;
  app.set("trust proxy", 1);
}
const csrf_options = {
  protected_operations: ["PATCH"],
  protected_content_types: ["application/json"],
  development_mode: csrf_development_mode,
  header_name: "X-CSRF-TOKEN",
  cookieParams: { sameSite: "None" },
};
const csrfMiddleware = csrf(csrf_options); //initialise and return middleware
module.exports = csrfMiddleware;
