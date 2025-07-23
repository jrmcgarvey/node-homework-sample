module.exports = {
  rootDir: "../../.",
  moduleNameMapper: {
    ".*validation/taskSchema.*": "<rootDir>/lesson11TDD/mocks/taskSchema.js",
    ".*validation/userSchema.*": "<rootDir>/lesson11TDD/mocks/userSchema.js",
    ".*controllers/taskController.*": "<rootDir>/lesson11TDD/mocks/taskController.js",
    ".*controllers/userController.*": "<rootDir>/lesson11TDD/mocks/userController.js",
    ".*services/userService.*":  "<rootDir>/lesson11TDD/mocks/userService.js",
    ".*passport/passport.*":  "<rootDir>/lesson11TDD/mocks/passport.js",
  },
  reporters: [
    "default",
    "./lesson11TDD/jestConfig/TDDReporter.js"
  ]
};