const express = require("express");
const jwtMiddleware = require("../middleware/jwtMiddleware");

const router = express.Router();
const { register, logoff, login } = require("../controllers/userController");

router.route("/logon").post(login);
router.route("/logoff").post(jwtMiddleware, logoff);
router.route("/").post(register);

module.exports = router;
