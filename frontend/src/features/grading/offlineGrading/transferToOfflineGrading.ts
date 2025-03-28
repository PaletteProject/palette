import { GroupedSubmissions, Rubric, Course, Assignment } from "palette-types";

function safeParse<T>(data: string | null, fallback: T): T {
  try {
    return data ? (JSON.parse(data) as T) : fallback;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return fallback;
  }
}

export function transferToOfflineGrading(
  activeCourse: Course,
  activeAssignment: Assignment,
  rubric: Rubric,
) {
  const activeCourseId = String(activeCourse.id);
  const activeAssignmentId = String(activeAssignment.id);
  const rubricId = String(rubric.id);

  if (!activeCourseId || !activeAssignmentId || !rubricId) {
    alert("No course, assignment, or rubric selected.");
    return;
  }

  const submissionsKey = `submissions_${activeCourseId}_${activeAssignmentId}`;
  const rubricKey = `rubric_${rubricId}`;

  const offlineSubmissionsKey = `offlineSubmissions_${activeCourseId}_${activeAssignmentId}`;
  const offlineRubricKey = `offlineRubric_${activeCourseId}_${activeAssignmentId}`;

  const courseNameMapKey = "courseNameMap";
  const assignmentNameMapKey = `assignmentNameMap_${activeCourseId}`;

  const courseNameMap: Record<string, string> = safeParse(
    localStorage.getItem(courseNameMapKey),
    {},
  );
  courseNameMap[activeCourseId] = activeCourse.name;
  localStorage.setItem(courseNameMapKey, JSON.stringify(courseNameMap));

  const assignmentNameMap: Record<string, string> = safeParse(
    localStorage.getItem(assignmentNameMapKey),
    {},
  );
  assignmentNameMap[activeAssignmentId] = activeAssignment.name;
  localStorage.setItem(assignmentNameMapKey, JSON.stringify(assignmentNameMap));

  const storedCoursesKey = "offlineCourses";
  const storedAssignmentsKey = `offlineAssignments_${activeCourseId}`;

  const storedCourses: string[] = safeParse(
    localStorage.getItem("offlineCourses"),
    [],
  );

  if (!storedCourses.includes(activeCourseId)) {
    storedCourses.push(activeCourseId);
    localStorage.setItem(storedCoursesKey, JSON.stringify(storedCourses));
  }

  const storedAssignments: string[] = safeParse(
    localStorage.getItem(`offlineAssignments_${activeCourseId}`),
    [],
  );

  if (!storedAssignments.includes(activeAssignmentId)) {
    storedAssignments.push(activeAssignmentId);
    localStorage.setItem(
      storedAssignmentsKey,
      JSON.stringify(storedAssignments),
    );
  }

  const submissionsRaw = localStorage.getItem(submissionsKey);
  const rubricRaw = localStorage.getItem(rubricKey);

  const submissionsData: GroupedSubmissions = submissionsRaw
    ? (JSON.parse(submissionsRaw) as GroupedSubmissions)
    : {};
  const rubricData: Rubric | null = rubricRaw
    ? (JSON.parse(rubricRaw) as Rubric)
    : null;

  if (Object.keys(submissionsData).length === 0 || rubricData === null) {
    alert(
      "No submissions or rubric found. Make sure grading data is available.",
    );
    return;
  }

  localStorage.setItem(offlineSubmissionsKey, JSON.stringify(submissionsData));
  localStorage.setItem(offlineRubricKey, JSON.stringify(rubricData));

  localStorage.setItem("offlineTransferPushRequired", "true");
  localStorage.setItem(
    "tokenGradedSubmissionCache",
    localStorage.getItem("offlineGradingCache") || "[]"
  );
}
