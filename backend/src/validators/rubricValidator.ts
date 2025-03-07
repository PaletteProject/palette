import { body, ValidationChain } from "express-validator";

/**
 * Rubric validation for incoming requests from the Palette application.
 */
const rubricValidator: ValidationChain[] = [
  body("title")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Rubric must have a title")
    .isLength({ max: 255 }) // max length: 255 characters
    .withMessage("Rubric title must not exceed 255 characters."),
  body("criteria")
    .isArray({ min: 1 })
    .withMessage("Rubric must have at least one criterion."),
  body("criteria.*.description") // * === all objects in the criteria array
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Each criterion must have a description"),
  body("criteria.*.longDescription").optional().isString(),
  body("criteria.*.pointsPossible")
    .isNumeric()
    .withMessage("Points field must be numeric"),
  body("criteria.*.isGroupCriterion")
    .isBoolean()
    .withMessage("Criterion must have group criterion flag"),
  body("criteria.*.ratings")
    .isArray({ min: 1 })
    .withMessage("Criterion must have at least one rating."),
  body("criteria.*.ratings.*.description")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Ratings must have a description."),
];

export default rubricValidator;
