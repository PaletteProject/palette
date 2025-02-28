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

const RESULTS_PER_PAGE = 100;

/**
 * Helper for handling course pagination from the Canvas API.
 */
async function getAllCourses() {
  let canvasCourses: CanvasCourse[] = [];
  let page = 1;
  let fetchedCourses: CanvasCourse[];

  do {
    fetchedCourses = await fetchAPI<CanvasCourse[]>(
      `/courses?per_page=${RESULTS_PER_PAGE}&page=${page}`,
    );

    canvasCourses = canvasCourses.concat(fetchedCourses);
    page++;
  } while (fetchedCourses.length === RESULTS_PER_PAGE); // continue if we received a full page

  return canvasCourses;
}

/**
 * Helper for handling assignment pagination from the Canvas API.
 */
async function getAllAssignments(courseId: string) {
  let canvasAssignments: CanvasAssignment[] = [];
  let page = 1;
  let fetchedAssignments: CanvasAssignment[];

  do {
    fetchedAssignments = await fetchAPI<CanvasAssignment[]>(
      `/courses/${courseId}/assignments?per_page=${RESULTS_PER_PAGE}&page=${page}`,
    );
    canvasAssignments = canvasAssignments.concat(fetchedAssignments);
    page++;
  } while (fetchedAssignments.length === RESULTS_PER_PAGE);

  return canvasAssignments;
}

/**
 * Helper for handling group pagination from the Canvas API.
 */
async function getAllGroups(courseId: string) {
  let canvasGroups: Group[] = [];
  let page = 1;
  let fetchedGroups: Group[];

  do {
    fetchedGroups = await fetchAPI<Group[]>(
      `/courses/${courseId}/groups?per_page=${RESULTS_PER_PAGE}&page=${page}`,
    );
    canvasGroups = canvasGroups.concat(fetchedGroups);
    page++;
  } while (fetchedGroups.length === RESULTS_PER_PAGE);

  return canvasGroups;
}

export type Group = {
  id: number;
  name: string;
};

type User = {
  id: number;
};

async function buildGroupLookupTable(courseId: string) {
  // get all the groups for the active course
  const groups: Group[] = await getAllGroups(courseId);

  console.log("Here are the GROUPS cxx");
  console.log(groups);

  // build the lookup map
  const userIdToGroupName = new Map<number, string>();

  for (const group of groups) {
    const roster: Partial<User>[] = await fetchAPI(`/groups/${group.id}/users`);
    roster.forEach((student) => {
      userIdToGroupName.set(student.id!, group.name);
    });
  }

  console.log(userIdToGroupName);

  return userIdToGroupName;
}

/**
 * Helper for handling submission pagination from the Canvas API.
 */
async function getAllSubmissions(courseId: string, assignmentId: string) {
  let canvasSubmissions: CanvasSubmissionResponse[] = [];
  let page = 1;
  let fetchedSubmissions: CanvasSubmissionResponse[];

  do {
    fetchedSubmissions = await fetchAPI<CanvasSubmissionResponse[]>(
      `/courses/${courseId}/assignments/${assignmentId}/submissions${SUBMISSION_QUERY_PARAMS}&per_page=${RESULTS_PER_PAGE}&page=${page}`,
    );
    canvasSubmissions = canvasSubmissions.concat(fetchedSubmissions);
    page++;
    console.log("HEY");
    console.log(fetchedSubmissions);
  } while (fetchedSubmissions.length === RESULTS_PER_PAGE);

  return canvasSubmissions;
}

/**
 * Helper to filter courses by enrollment type and start date (for now).
 * @param canvasCourses
 */
function filterCourses(canvasCourses: CanvasCourse[]): CanvasCourse[] {
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  // Step 1: Filter by valid enrollments (teacher or TA)
  let filteredCourses = canvasCourses.filter((course) =>
    course.enrollments?.some(
      (enrollment) => enrollment.type === "teacher" || enrollment.type === "ta",
    ),
  );

  // Step 2: Conditionally filter by start date if there are more than 5 courses
  // todo: temp fix until custom filters are added
  if (filteredCourses.length > 5) {
    filteredCourses = filteredCourses.filter((course) => {
      // start_at is an optional prop in canvas, created_at will always be generated
      const startDate = course.created_at ? new Date(course.created_at) : null;
      return startDate ? startDate >= twoYearsAgo : false;
    });
  }

  return filteredCourses;
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
    const canvasCourses = await getAllCourses();

    return filterCourses(canvasCourses)
      .map(mapToPaletteCourse)
      .filter((course): course is Course => course !== null);
  },

  async getAssignments(courseId: string): Promise<Assignment[]> {
    if (!courseId) {
      throw new Error("Course ID is undefined");
    }
    const canvasAssignments = await getAllAssignments(courseId);
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
    const canvasSubmissions = await getAllSubmissions(courseId, assignmentId);

    return transformSubmissions(
      canvasSubmissions,
      await buildGroupLookupTable(courseId),
    );
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
