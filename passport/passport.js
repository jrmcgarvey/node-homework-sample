const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");
const { verifyUserPassword } = require("../services/userService");

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
        return done(null, { id: user.id }); // this object goes to req.user.
      } catch (err) {
        return done(err);
      }
    },
  ),
);
const { Strategy: JwtStrategy } = require("passport-jwt");

const cookieExtractor = (req) => req?.cookies?.jwt || null;

const jwtOptions = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, (jwtPayload, done) => {
    return done(null, jwtPayload);
  }),
);
