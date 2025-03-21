import { CanvasSubmissionResponse } from "palette-types/dist/canvasProtocol/canvasSubmissionResponse";
import {
  Assignment,
  CanvasAssignment,
  CanvasCourse,
  Course,
  Submission,
} from "palette-types";
import { GroupedSubmissions } from "palette-types/dist/types/GroupedSubmissions";

/**
 * Convert canvas course object to palette course object.
 * @param canvasCourse - course information from the Canvas API.
 * @returns Valid courses entry to display or null to be filtered out.
 */
export function mapToPaletteCourse(canvasCourse: CanvasCourse): Course | null {
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
    term: canvasCourse.term,
    isPublic: canvasCourse.is_public,
    defaultView: canvasCourse.default_view,
    enrollments: teacherOrTaEnrollments.map((enrollment) => ({
      type: enrollment.type as "teacher" | "ta", // Type assertions to ensure compatibility
      enrollmentState: enrollment.enrollment_state,
    })),
    courseFormat: canvasCourse.course_format,
  } as Course;
}

/**
 * Convert CanvasAssignment object to Palette Assignment object.
 *
 * Stores rubric id to fetch rubric when needed.
 * @param canvasAssignment - assignment information from the Canvas API.
 * @returns Valid assignment entry to display.
 */
export function mapToPaletteAssignment(
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
    createdAt: canvasAssignment.created_at || "",
  };
}

/**
 * Canvas provides way more info than what we need. Pick from data and throw an error if something is missing.
 * @param canvasResponse
 */
const mapToPaletteSubmission = (
  canvasResponse: CanvasSubmissionResponse,
): Submission => {
  // return array of transformed comments
  const transformComments = () => {
    return canvasResponse.submission_comments.map((comment) => {
      return {
        id: comment.id,
        authorName: comment.author_name,
        comment: comment.comment,
      };
    });
  };

  return {
    id: canvasResponse.id,
    user: {
      id: canvasResponse.user?.id,
      name: canvasResponse.user?.name,
      asurite: canvasResponse.user?.login_id,
    },
    group: {
      id: canvasResponse.group?.id,
      name: canvasResponse.group?.name || "",
    },
    comments: transformComments(),
    rubricAssessment: canvasResponse.rubric_assessment,
    workflowState: canvasResponse.workflow_state, // status of the submission
    graded: canvasResponse?.graded_at || false,
    gradedBy: canvasResponse.grader_id,
    late: canvasResponse.late || undefined,
    missing: canvasResponse.missing || undefined,
    attachments: canvasResponse.attachments,
  } as Submission;
};

export const transformSubmissions = (
  canvasResponse: CanvasSubmissionResponse[],
  groupMap: Map<number, string>,
) => {
  const lookUpGroup = (userId: number) => {
    const groupName = groupMap.get(userId);

    return groupName ? groupName : "No Group";
  };

  if (!canvasResponse)
    throw new Error("Invalid canvas submission.. cannot transform.");

  // convert submissions to palette format
  const transformedSubmissions = canvasResponse.map(mapToPaletteSubmission);

  // key value object to organize group submissions and is serializable
  const groupedSubmissions: GroupedSubmissions = {
    "No Group": [],
  };

  transformedSubmissions.forEach((submission) => {
    const groupName =
      submission.group.name !== ""
        ? submission.group.name
        : lookUpGroup(submission.user.id);

    // initialize group if it doesn't already exist
    if (!groupedSubmissions[groupName]) {
      groupedSubmissions[groupName] = [];
    }

    groupedSubmissions[groupName].push(submission);
  });

  return groupedSubmissions;
};
