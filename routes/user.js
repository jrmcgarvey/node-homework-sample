const express = require("express");

const router = express.Router();
const { register, logoff, login } = require("../controllers/userController");

router.route("/logon").post(login);
router.route("/logoff").post(logoff);
router.route("/").post(register);

module.exports = router;
