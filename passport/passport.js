const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");
const { verifyUserPassword } = require("../services/userService");
const { StatusCodes } = require("http-status-codes");
const { randomUUID } = require("crypto");
const jwt = require("jsonwebtoken");

const setJwtCookie = (req, res, user) => {
  // Sign JWT
  const payload = { id: user.id, name: user.name, csrfToken: randomUUID() }; // put a csrfToken in
  req.user = payload;
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" }); // 1 hour expiration

  // Set cookie
  res.cookie("jwt", token, {
    ...(process.env.NODE_ENV === "production" && { domain: req.hostname }), // add domain into cookie for production only
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 3600000, // 1 hour expiration.  Ends up as max-age 3600 in the cookie.
  });
};

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    }, // Note: this piece of configuration, as critical as it is, is not documented
    // in the passport documentation, which is very very bad.  This is how you tell
    // passport to extract the username (in this case the email) and the password from
    // req.body.  Remember this!
    async (username, password, done) => {
      try {
        const { user, isValid } = await verifyUserPassword(username, password);
        if (!isValid)
          return done(null, null, { message: "Authentication failed." });
        return done(null, user); // this object goes to req.user.
      } catch (err) {
        done(err);
      }
    },
  ),
);

const logonRouteHandler = async (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user) => {
    if (err) {
      return next(err);
    } else {
      if (!user) {
        res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "Authentication failed" });
      } else {
        setJwtCookie(req, res, user);
        res.json({ name: user.name, csrfToken: req.user.csrfToken });
      }
    }
  })(req, res);
};

const { Strategy: JwtStrategy } = require("passport-jwt");
const cookieExtractor = (req) => {
  return req?.cookies?.jwt || null;
};
const jwtOptions = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRET,
};
passport.use(
  new JwtStrategy(jwtOptions, (jwtPayload, done) => {
    return done(null, jwtPayload);
  }),
);

const jwtMiddleware = async (req, res, next) => {
  passport.authenticate("jwt", { session: false, failWithError: false }, (err, user) => {
    if (err) {
      return next(err); // don't throw the error!
    }
    if (user) {
      let loggedOn = true;
      if (["POST", "PATCH", "PUT", "DELETE", "CONNECT"].includes(req.method)) {
        if (req.get("X-CSRF-TOKEN") != user.csrfToken) {
          loggedOn = false;
        }
      }
      if (loggedOn) {
        req.user = user;
        return next();
      }
    }
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
  })(req, res);
};

module.exports = { logonRouteHandler, jwtMiddleware, setJwtCookie };
