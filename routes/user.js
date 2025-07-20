const express = require("express");
const { jwtMiddleware, logonRouteHandler } = require("../passport/passport")

const router = express.Router();
const { register, logoff } = require("../controllers/userController");

router.route("/logon").post(logonRouteHandler);
router.route("/logoff").post(jwtMiddleware, logoff);
router.route("/").post(register);

module.exports = router;
