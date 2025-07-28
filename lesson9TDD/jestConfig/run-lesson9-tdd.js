const { execSync } = require("child_process");

try {
  execSync("NODE_ENV=test npx jest --testPathPatterns=test/ --verbose --maxWorkers=1 --config ./lesson11TDD/jestConfig/jest.config.js", { stdio: "inherit" });
  // console.log("✅ All tests failed as expected (good)");
} catch (e) {
  // console.log(`name: ${e.name} ${e.message} ${e.stack}`)
  // console.error("⚠️ Some student test passed when it shouldn't have.");
  process.exit(1);
}
