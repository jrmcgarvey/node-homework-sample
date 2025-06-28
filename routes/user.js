const express = require("express");
const csrfMiddleware = require("../csrf/csrf");

const router = express.Router();
const { login, register, logoff } = require("../controllers/userController");

router.route("/logon").post(login);
router.route("/logoff").post(csrfMiddleware, logoff);
router.route("/register").post(register);

module.exports = router;
