module.exports = {
  rootDir: "../../.",
  moduleNameMapper: {
    ".*validation/taskSchema.*": "<rootDir>/lesson9TDD/mocks/taskSchema.js",
    ".*validation/userSchema.*": "<rootDir>/lesson9TDD/mocks/userSchema.js",
    ".*controllers/taskController.*": "<rootDir>/lesson9TDD/mocks/taskController.js",
    ".*controllers/userController.*": "<rootDir>/lesson9TDD/mocks/userController.js",
    ".*services/userService.*":  "<rootDir>/lesson9TDD/mocks/userService.js",
    ".*passport/passport.*":  "<rootDir>/lesson9TDD/mocks/passport.js",
  },
  reporters: [
    "default",
    "./lesson9TDD/jestConfig/TDDReporter.js"
  ]
};