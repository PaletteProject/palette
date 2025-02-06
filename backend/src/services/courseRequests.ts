/**
 * Service functionality for course and assignment-related queries.
 */

import { fetchAPI } from "../utils/fetchAPI.js";
import {
  Assignment,
  CanvasAssignment,
  CanvasCourse,
  Course,
} from "palette-types";
import { CanvasSubmissionResponse } from "palette-types/dist/canvasProtocol/canvasSubmissionResponse";
import {
  mapToPaletteAssignment,
  mapToPaletteCourse,
  transformSubmissions,
} from "./transformers.js";
import { GroupedSubmissions } from "palette-types/dist/types/GroupedSubmissions";

const SUBMISSION_QUERY_PARAMS =
  "?include[]=group&include[]=user&include[]=submission_comments&grouped=true&include[]=rubric_assessment";

type GradedSubmission = {
  submission_id: number;
  user: { id: number; name: string; asurite: string };
  rubric_assessment: {
    [p: string]: { points: number; rating_id: string; comments: string };
  };
};

/**
 * Defines CRUD operations for courses from the Canvas API.
 */
export const CoursesAPI = {
  /**
   * Gets all courses that the user is enrolled in with the role of Teacher or TA.
   *
   * @returns Promise for a filtered array of course objects.
   */
  async getCourses(): Promise<Course[]> {
    const canvasCourses = await fetchAPI<CanvasCourse[]>(
      "/courses?per_page=50",
    );

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Step 1: Filter by valid enrollments (teacher or TA)
    let filteredCourses = canvasCourses.filter((course) =>
      course.enrollments?.some(
        (enrollment) =>
          enrollment.type === "teacher" || enrollment.type === "ta",
      ),
    );

    // Step 2: Conditionally filter by start date if there are more than 5 courses
    // todo: temp fix until custom filters are added
    if (filteredCourses.length > 5) {
      filteredCourses = filteredCourses.filter((course) => {
        const startDate = course.start_at ? new Date(course.start_at) : null;
        return startDate ? startDate >= oneYearAgo : false;
      });
    }

    console.log("Filtered courses BELOW");
    console.log(filteredCourses);

    return filteredCourses
      .map(mapToPaletteCourse)
      .filter((course): course is Course => course !== null);
  },

  async getAssignments(courseId: string): Promise<Assignment[]> {
    if (!courseId) {
      throw new Error("Course ID is undefined");
    }
    const canvasAssignments = await fetchAPI<CanvasAssignment[]>(
      `/courses/${courseId}/assignments?per_page=50`,
    );
    return canvasAssignments.map(mapToPaletteAssignment);
  },

  async getAssignment(
    courseId: string,
    assignmentId: string,
  ): Promise<Assignment> {
    const canvasAssignment = await fetchAPI<CanvasAssignment>(
      `/courses/${courseId}/assignments/${assignmentId}`,
    );

    return mapToPaletteAssignment(canvasAssignment);
  },

  async getSubmissions(
    courseId: string,
    assignmentId: string,
  ): Promise<GroupedSubmissions> {
    const canvasSubmissions = await fetchAPI<CanvasSubmissionResponse[]>(
      `/courses/${courseId}/assignments/${assignmentId}/submissions${SUBMISSION_QUERY_PARAMS}`,
    );

    return transformSubmissions(canvasSubmissions);
  },

  async putSubmission(
    courseId: string,
    assignmentId: string,
    studentId: string,
    submission: GradedSubmission,
  ) {
    return await fetchAPI<null>(
      `/courses/${courseId}/assignments/${assignmentId}/submissions/${studentId}`,
      {
        method: "PUT",
        body: JSON.stringify(submission),
      },
    );
  },
};
