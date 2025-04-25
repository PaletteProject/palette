import express from "express";
import { validationErrorHandler } from "../middleware/validationErrorHandler.js";

import { handleDeleteRubric } from "../controllers/rubricControllers/handleDeleteRubric.js";
import rubricValidator from "../validators/rubricValidator.js";
import {
  assignmentParamValidator,
  courseParamValidator,
  rubricIdParamValidator,
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
import {
  getSubmissions,
  submitGrades,
} from "../controllers/submissionController.js";

const courseRouter = express.Router();

/**
 * @swagger
 * /courses/{course_id}/assignments/{assignment_id}/submissions:
 *   get:
 *     summary: Get submissions for a specific assignment
 *     description: Retrieve all submissions for a specific assignment in a course.
 *     parameters:
 *       - in: path
 *         name: course_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course.
 *       - in: path
 *         name: assignment_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the assignment.
 *     responses:
 *       200:
 *         description: A list of submissions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Validation error.
 */

courseRouter.get(
  "/:course_id/assignments/:assignment_id/submissions",
  courseParamValidator,
  assignmentParamValidator,
  validationErrorHandler,
  getSubmissions,
);

courseRouter.put(
  "/:course_id/assignments/:assignment_id/submissions/:student_id",
  courseParamValidator,
  assignmentParamValidator,
  // todo: validate the payload submission
  submitGrades,
);

/**
 * @swagger
 * /courses/{course_id}/rubrics/{assignment_id}:
 *   post:
 *     summary: Create a new rubric
 *     description: Create a new rubric in a specific course for a given assignment.
 *     parameters:
 *       - in: path
 *         name: course_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course.
 *       - in: path
 *         name: assignment_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the assignment.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Example Rubric
 *               criteria:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *     responses:
 *       201:
 *         description: Rubric created successfully.
 *       400:
 *         description: Validation error.
 * @route POST /courses/:courseID/rubrics
 * @description Create a new rubric in a specific course.
 */
courseRouter.post(
  "/:course_id/rubrics/:assignment_id",
  courseParamValidator,
  assignmentParamValidator,
  rubricValidator,
  validationErrorHandler,
  createRubric,
);

/**
 * @swagger
 * /courses/{course_id}/rubrics/{rubric_id}:
 *   get:
 *     summary: Get a rubric by ID
 *     description: Retrieve a specific rubric by its ID in a course.
 *     parameters:
 *       - in: path
 *         name: course_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course.
 *       - in: path
 *         name: rubric_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the rubric.
 *     responses:
 *       200:
 *         description: A rubric object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 criteria:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Rubric not found.
 * @route GET /courses/:course_id/rubrics/:id
 * @description Get a rubric by its ID in a specific course.
 */
courseRouter.get(
  "/:course_id/rubrics/:rubric_id",
  courseParamValidator,
  rubricIdParamValidator,
  validationErrorHandler,
  getRubric,
);

/**
 * @swagger
 * /courses/{course_id}/rubrics:
 *   get:
 *     summary: Get all rubrics in a course
 *     description: Retrieve all rubrics associated with a specific course.
 *     parameters:
 *       - in: path
 *         name: course_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course.
 *     responses:
 *       200:
 *         description: A list of rubrics.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 * @route GET /courses/:course_id/rubrics
 * @description Get all rubrics in a specific course.
 * @route - GET courses/
 */
courseRouter.get(
  "/:course_id/rubrics",
  courseParamValidator,
  validationErrorHandler,
  getAllRubrics,
);

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Retrieve all courses
 *     description: Get all courses for the authenticated user.
 *     responses:
 *       200:
 *         description: A list of courses.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: 101
 *                   name:
 *                     type: string
 *                     example: Example Course
 * @route GET /courses
 * @description Get all courses for the current user
 */
courseRouter.get("/", getAllCourses);

/**
 * @swagger
 * /courses/{course_id}/rubrics/{rubric_id}/{assignment_id}:
 *   put:
 *     summary: Update a rubric by its ID
 *     description: Update a specific rubric associated with a course and assignment.
 *     parameters:
 *       - in: path
 *         name: course_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course.
 *       - in: path
 *         name: rubric_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the rubric.
 *       - in: path
 *         name: assignment_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the assignment.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Rubric"
 *               criteria:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *     responses:
 *       200:
 *         description: The rubric has been successfully updated.
 *       400:
 *         description: Invalid input or missing fields.
 *       404:
 *         description: Rubric not found.
 * @route PUT /courses/:course_id/rubrics/:id
 * @description Update a rubric by its ID in a specific course.
 */
courseRouter.put(
  "/:course_id/rubrics/:rubric_id/:assignment_id",
  courseParamValidator,
  assignmentParamValidator,
  rubricValidator,
  validationErrorHandler,
  updateRubric,
);

/**
 * @swagger
 * /courses/{course_id}/rubrics/{rubric_id}:
 *   delete:
 *     summary: Delete a rubric by its ID
 *     description: Remove a rubric from a course by its ID.
 *     parameters:
 *       - in: path
 *         name: course_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course.
 *       - in: path
 *         name: rubric_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the rubric to be deleted.
 *     responses:
 *       200:
 *         description: The rubric has been deleted successfully.
 *       404:
 *         description: Rubric not found.
 * @route DELETE /courses/:course_id/rubrics/:id
 * @description Delete a rubric by its ID in a specific course.
 */
courseRouter.delete(
  "/:course_id/rubrics/:rubric_id",
  rubricIdParamValidator,
  validationErrorHandler,
  handleDeleteRubric,
);

/**
 * @swagger
 * /courses/{course_id}/assignments:
 *   get:
 *     summary: Retrieve all assignments in a course
 *     description: Get all assignments for a given course.
 *     parameters:
 *       - in: path
 *         name: course_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course.
 *     responses:
 *       200:
 *         description: A list of assignments.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: 202
 *                   name:
 *                     type: string
 *                     example: Assignment 1
 * @route GET /courses/:courseID/assignments
 * @description Get all assignments for a course
 */
courseRouter.get("/:course_id/assignments", getAssignments);

/**
 * @swagger
 * /courses/{course_id}/assignments/{assignment_id}:
 *   get:
 *     summary: Get an assignment by ID
 *     description: Retrieve a specific assignment by its ID within a course.
 *     parameters:
 *       - in: path
 *         name: course_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course.
 *       - in: path
 *         name: assignment_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the assignment.
 *     responses:
 *       200:
 *         description: Assignment details.
 *         content:
 *           application/json:
 *             schema:
 *               type: objec
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *       404:
 *         description: Assignment not found.
 * @route GET /courses/:courseId/assignments/:assignmentId
 */
courseRouter.get("/:course_id/assignments/:assignment_id", getAssignment);

export default courseRouter;
