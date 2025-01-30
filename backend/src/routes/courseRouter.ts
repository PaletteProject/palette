import express from "express";
import { validationErrorHandler } from "../middleware/validationErrorHandler.js";

import { handleDeleteRubric } from "../controllers/rubricControllers/handleDeleteRubric.js";
import rubricValidator from "../validators/rubricValidator.js";
import {
  assignmentParamValidator,
  courseParamValidator,
  idAndCourseParamValidator,
} from "../validators/paramValidators.js";

import {
  getAllCourses,
  getAssignment,
  getAssignments,
} from "../controllers/courseController.js";

import {
  createRubric,
  getAllRubrics,
  getRubric,
  updateRubric,
} from "../controllers/rubricController.js";
import { getSubmissions } from "../controllers/submissionController.js";

const courseRouter = express.Router();

/**
 * Submission Routes
 */
courseRouter.get(
  "/:course_id/assignments/:assignment_id/submissions",
  courseParamValidator,
  assignmentParamValidator,
  validationErrorHandler,
  getSubmissions
);

/**
 * @route POST /courses/:courseID/rubrics
 * @description Create a new rubric in a specific course.
 */
courseRouter.post(
  "/:course_id/rubrics/:assignment_id",
  courseParamValidator,
  assignmentParamValidator,
  rubricValidator,
  validationErrorHandler,
  createRubric
);

/**
 * @route GET /courses/:course_id/rubrics/:id
 * @description Get a rubric by its ID in a specific course.
 */
courseRouter.get(
  "/:course_id/rubrics/:rubric_id",
  idAndCourseParamValidator,
  validationErrorHandler,
  getRubric
);

/**
 * @route GET /courses/:course_id/rubrics
 * @description Get all rubrics in a specific course.
 * @route - GET courses/
 */
courseRouter.get(
  "/:course_id/rubrics",
  courseParamValidator,
  validationErrorHandler,
  getAllRubrics
);

/**
 * @route GET /courses
 * @description Get all courses for the current user
 */
courseRouter.get("/", getAllCourses);

/**
 * @route PUT /courses/:course_id/rubrics/:id
 * @description Update a rubric by its ID in a specific course.
 */
courseRouter.put(
  "/:course_id/rubrics/:rubric_id/:assignment_id",
  idAndCourseParamValidator,
  assignmentParamValidator,
  rubricValidator,
  validationErrorHandler,
  updateRubric
);

/**
 * @route DELETE /courses/:course_id/rubrics/:id
 * @description Delete a rubric by its ID in a specific course.
 */
courseRouter.delete(
  "/:course_id/rubrics/:rubric_id",
  idAndCourseParamValidator,
  validationErrorHandler,
  handleDeleteRubric
);

/**
 * @route GET /courses/:courseID/assignments
 * @description Get all assignments for a course
 */
courseRouter.get("/:course_id/assignments", getAssignments);

/**
 * @route GET /courses/:courseId/assignments/:assignmentId
 */
courseRouter.get("/:course_id/assignments/:assignment_id", getAssignment);

export default courseRouter;
