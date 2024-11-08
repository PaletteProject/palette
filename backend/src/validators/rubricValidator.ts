import { body } from "express-validator";

/**
 * define validation for rubrics before being stored on the database
 */
const createRubricValidator = () => [
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
  body("criteria.*.points")
    .isNumeric()
    .withMessage("Points field must be numeric"),
  body("criteria.*.ratings")
    .isArray({ min: 1 })
    .withMessage("Criterion must have at least one rating."),
  body("criteria.*.ratings.*.description")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Ratings must have a description."),
];

export default createRubricValidator;
