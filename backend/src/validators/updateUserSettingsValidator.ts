import { body, ValidationChain } from "express-validator";

export const updateUserSettingsValidator: ValidationChain[] = [
  // body().custom(isValidSettingsObject),
  body("userName").isString().withMessage("Username must be a string"),
  body("templateCriteria")
    .isArray()
    .withMessage("templateCriteria must be an array"),
  body("token")
    .isString()
    .withMessage("Canvas API token must be a string")
    .matches(/^[a-zA-Z0-9~]+$/)
    .withMessage(
      "Canvas API token must be alphanumeric. It may include the ~ character.",
    ),
  body("preferences").isObject().withMessage("Preferences must be an object"),
  body("preferences.darkMode")
    .isBoolean()
    .withMessage("preferences.darkMode must be a boolean"),
  body("preferences.defaultScale")
    .isNumeric()
    .withMessage("preferences.defaultScale must be a number"),
];
