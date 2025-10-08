const express = require("express");
const { jwtMiddleware, logonRouteHandler } = require("../passport/passport")

const router = express.Router();
const { register, googleLogon, logoff } = require("../controllers/userController");

router.route("/logon").post(logonRouteHandler);
router.route("/googleLogon").post(googleLogon);
router.route("/logoff").post(jwtMiddleware, logoff);
router.route("/").post(register);

module.exports = router;
