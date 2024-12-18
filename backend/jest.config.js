export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/dist/", "/node_modules/"], // Don't run tests in these directories
  // tell jest to interpret .js-ending files as .ts files during testing
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
