const csrf = require("host-csrf");
const csrf_options = {
  headerName: "X-CSRF-TOKEN",
};
const csrfMiddleware = csrf.csrf(csrf_options); //initialise and return middleware
module.exports = csrfMiddleware;
