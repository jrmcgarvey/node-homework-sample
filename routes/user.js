const express = require("express");
const auth = require("../middleware/auth")

const router = express.Router();
const { login, register, logoff, getNameAndCSRFToken } = require("../controllers/userController");

router.route("/logon").post(login);
router.route("/logoff").post(auth, logoff);
router.route("/register").post(register);
router.route("/nameAndToken").get(auth, getNameAndCSRFToken);

module.exports = router;
