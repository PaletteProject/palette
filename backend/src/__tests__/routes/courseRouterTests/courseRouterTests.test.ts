import express from "express";
import supertest from "supertest";
import { app } from "../../../app.js";

const COURSE_ROUTE = "/api/courses";

/**
 * @route PUT /courses/:courseID/assignments/:assignmentID/submissions/:studentID
 * @description Submit grades for a specific assignment.
 */

describe("Graded Submission Router", () => {
  describe("given a course, assignment, and student", () => {
    it("should submit grades for a specific course, assignment, and student", async () => {
      const response = await supertest(app).put(
        `${COURSE_ROUTE}/1/assignments/1/submissions/1`
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "submitted grades",
      });
    });
  });
});

/**
 * @route POST /courses/:courseID/rubrics
 * @description Create a new rubric in a specific course.
 */

describe("Rubric Router", () => {
  describe("given a course and assignment", () => {
    it("should create a new rubric", async () => {
      const response = await supertest(app).post(`${COURSE_ROUTE}/1/rubrics/1`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "New rubric created successfully",
      });
    });
  });
});

/**
 * @route PUT /courses/:course_id/rubrics/:id
 * @description Update a rubric by its ID in a specific course.
 */
describe("Rubric Router", () => {
  describe("given a course and rubric ID", () => {
    it("should update a rubric", async () => {
      const response = await supertest(app).put(
        `${COURSE_ROUTE}/1/rubrics/1/1`
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Rubric updated successfully!",
      });
    });
  });
});
