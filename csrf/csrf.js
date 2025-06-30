const csrf = require("host-csrf");
const csrf_development_mode =
  process.env.NODE_ENV === "production" ? false : true;
const csrf_options = {
  protected_operations: ["PATCH"],
  protected_content_types: ["application/json"],
  development_mode: csrf_development_mode,
  header_name: "X-CSRF-TOKEN",
  cookieParams: { sameSite: "None" },
};
const csrfMiddleware = csrf(csrf_options); //initialise and return middleware
module.exports = csrfMiddleware;
