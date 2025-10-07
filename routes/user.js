const express = require("express");
const jwtMiddleware = require("../middleware/jwtMiddleware");

const router = express.Router();
const { register, logoff, logon } = require("../controllers/userController");

router.route("/logon").post(logon);
router.route("/logoff").post(jwtMiddleware, logoff);
router.route("/").post(register);

module.exports = router;
