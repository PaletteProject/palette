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

/**
 * Convert canvas course object to palette course object.
 * @param canvasCourse - course information from the Canvas API.
 * @returns Valid courses entry to display or null to be filtered out.
 */
function mapToPaletteCourse(canvasCourse: CanvasCourse): Course | null {
  const teacherOrTaEnrollments = canvasCourse.enrollments?.filter(
    (enrollment) =>
      (enrollment.type === "teacher" || enrollment.type === "ta") &&
      enrollment.enrollment_state === "active",
  );

  // Return null if no matching enrollments are found
  if (!teacherOrTaEnrollments || teacherOrTaEnrollments.length === 0) {
    return null;
  }

  return {
    id: canvasCourse.id,
    name: canvasCourse.name,
    courseCode: canvasCourse.course_code,
    termId: canvasCourse.enrollment_term_id,
    isPublic: canvasCourse.is_public,
    defaultView: canvasCourse.default_view,
    enrollments: teacherOrTaEnrollments.map((enrollment) => ({
      type: enrollment.type as "teacher" | "ta", // Type assertions to ensure compatibility
      enrollmentState: enrollment.enrollment_state,
    })),
  } as Course;
}

/**
 * Convert CanvasAssignment object to Palette Assignment object.
 *
 * Stores rubric id to fetch rubric when needed.
 * @param canvasAssignment - assignment information from the Canvas API.
 * @returns Valid assignment entry to display.
 */
function mapToPaletteAssignment(
  canvasAssignment: CanvasAssignment,
): Assignment {
  return {
    id: canvasAssignment.id,
    name: canvasAssignment.name,
    description: canvasAssignment.description || "",
    dueDate: canvasAssignment.due_at || "",
    pointsPossible: canvasAssignment.points_possible,
    rubricId:
      canvasAssignment.rubric && canvasAssignment.rubric_settings
        ? canvasAssignment.rubric_settings.id
        : undefined,
  };
}

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
      "/courses?enrollment_type=teacher&per_page=25",
    );

    // map canvas courses to palette courses and filter out any null entries
    return canvasCourses
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
    if (!assignmentId) {
      throw new Error("Assignment ID is undefined");
    }
    const canvasAssignment = await fetchAPI<CanvasAssignment>(
      `courses/${courseId}/assignments/${assignmentId}`,
    );

    return mapToPaletteAssignment(canvasAssignment);
  },
};
