/**
 * Service functionality for course and assignment-related queries.
 */

import { fetchAPI } from "../utils/fetchAPI.js";
import {
  Assignment,
  CanvasAssignment,
  CanvasCourse,
  CanvasGradedSubmission,
  Course,
  PaletteGradedSubmission,
} from "palette-types";
import { CanvasSubmissionResponse } from "palette-types/dist/canvasProtocol/canvasSubmissionResponse";
import {
  mapToPaletteAssignment,
  mapToPaletteCourse,
  transformSubmissions,
} from "./transformers.js";
import { GroupedSubmissions } from "palette-types/dist/types/GroupedSubmissions";
import { SettingsAPI } from "../settings.js";

const SUBMISSION_QUERY_PARAMS =
  "?include[]=group&include[]=user&include[]=submission_comments&grouped=true&include[]=rubric_assessment";

const RESULTS_PER_PAGE = 100;

let yearThreshold = new Date();
let courseFormat = "";
let courseCode = "";
const developerCourseCode = "DEV-2019Spring-SER515-Group5-TestShell";
const courseCodes = ["CS", "CSE", "CSC", "SER", "EEE"];

/**
 * Helper for handling course pagination from the Canvas API.
 */
async function getAllCourses() {
  let canvasCourses: CanvasCourse[] = [];
  let page = 1;
  let fetchedCourses: CanvasCourse[];

  const userSettings = SettingsAPI.getUserSettings();
  const courseFilters = userSettings.course_filters;

  // collect and stores filters
  if (courseFilters) {
    for (const filter of courseFilters) {
      const year = new Date(parseInt(filter.option), 0, 1);

      if (!isNaN(parseInt(filter.option))) {
        yearThreshold = year;
        console.log("year");
        console.log(year);
        console.log(filter.option);
        console.log("yearThreshold");
        console.log(yearThreshold);
      } else if (courseCodes.includes(filter.option)) {
        courseCode = filter.option;
      } else if (filter.param_code === "course_format") {
        courseFormat = filter.option;
      } else if (filter.param_code === "course_code") {
        courseCode = filter.option;
      }
    }
  }

  do {
    fetchedCourses = await fetchAPI<CanvasCourse[]>(
      `/courses?per_page=${RESULTS_PER_PAGE}&page=${page}`,
    );

    canvasCourses = canvasCourses.concat(fetchedCourses);
    page++;
  } while (fetchedCourses.length === RESULTS_PER_PAGE); // continue if we received a full page

  return { canvasCourses, courseFilters };
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

export type Group = { id: number; name: string };

type User = { id: number };

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
 *
 */
function filterCourses(
  canvasCourses: CanvasCourse[],
  courseFilters: { id: string; option: string; param_code: string }[],
): CanvasCourse[] {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  console.log(oneYearAgo);

  console.log("courseFilters");
  console.log(courseFilters);

  // Step 0: Save the developer course so it doesn't get filtered out
  const developerCourse = canvasCourses.find((course) => {
    return course.course_code === developerCourseCode;
  });

  // Step 1: Filter by valid enrollments (teacher or TA)
  let filteredCourses = canvasCourses.filter((course) =>
    course.enrollments?.some(
      (enrollment) => enrollment.type === "teacher" || enrollment.type === "ta",
    ),
  );

  // console.log("Step 1: Filter by valid enrollments");
  // console.log(filteredCourses);

  // Step 2: Filter by start date
  if (courseFilters.some((filter) => filter.param_code === "start_at")) {
    filteredCourses = filteredCourses.filter((course) => {
      const startDate =
        course.start_at === null ? new Date() : new Date(course.start_at);
      console.log("startDate");
      console.log(startDate);
      console.log("yearThreshold");
      console.log(yearThreshold);
      return startDate ? startDate >= yearThreshold : false;
    });
  }

  // console.log("Step 2: Filter by start date");
  // console.log(filteredCourses);

  // Step 3: Filter by course format
  if (courseFilters.some((filter) => filter.param_code === "course_format")) {
    filteredCourses = filteredCourses.filter((course) => {
      return course.course_format === courseFormat;
    });
  }

  // console.log("Step 3: Filter by course format");
  // console.log(filteredCourses);

  // Step 4: Filter by course code
  if (courseFilters.some((filter) => filter.param_code === "course_code[]")) {
    filteredCourses = filteredCourses.filter((course) => {
      const courseCodeArray = course.course_code.split("-");

      const courseCodeArrayMinusNumbers = courseCodeArray.map((code) =>
        code.replace(/\d+/g, "").trim(),
      );

      return courseCodeArrayMinusNumbers.some((code) =>
        code.includes(courseCode),
      );
    });
  }

  // console.log("Step 4: Filter by course code");
  // console.log(filteredCourses);

  // Step 5: Always include the developer course to the Palette team (if not already included)
  if (
    developerCourse &&
    !filteredCourses.some(
      (course) => course.course_code === developerCourseCode,
    )
  ) {
    filteredCourses.push(developerCourse);
  }

  console.log("Step 5: Include developer course");
  console.log(filteredCourses);

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
    const { canvasCourses, courseFilters } = await getAllCourses();

    return filterCourses(canvasCourses, courseFilters ?? [])
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
    submission: PaletteGradedSubmission,
  ) {
    const isGroupComment =
      submission.group_comment !== undefined && !submission.group_comment.sent;

    const submissionBody = {
      submission_id: submission.submission_id,
      user: submission.user,
      rubric_assessment: submission.rubric_assessment,
      comment: {
        text_comment: isGroupComment
          ? submission.group_comment?.text_comment
          : submission.individual_comment?.text_comment,
        group_comment: isGroupComment,
      },
    } as CanvasGradedSubmission;

    return await fetchAPI<null>(
      `/courses/${courseId}/assignments/${assignmentId}/submissions/${studentId}`,
      { method: "PUT", body: JSON.stringify(submissionBody) },
    );
  },
};
