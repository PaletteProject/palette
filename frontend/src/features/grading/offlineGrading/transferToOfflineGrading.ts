import { GroupedSubmissions, Rubric, Course, Assignment } from "palette-types";

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

  // ⬇️ NEW: Save name mappings
  const courseNameMapKey = "courseNameMap";
  const assignmentNameMapKey = `assignmentNameMap_${activeCourseId}`;

  const courseNameMap = JSON.parse(localStorage.getItem(courseNameMapKey) || "{}");
  courseNameMap[activeCourseId] = activeCourse.name;
  localStorage.setItem(courseNameMapKey, JSON.stringify(courseNameMap));

  const assignmentNameMap = JSON.parse(localStorage.getItem(assignmentNameMapKey) || "{}");
  assignmentNameMap[activeAssignmentId] = activeAssignment.name;
  localStorage.setItem(assignmentNameMapKey, JSON.stringify(assignmentNameMap));

  const storedCoursesKey = "offlineCourses";
  const storedAssignmentsKey = `offlineAssignments_${activeCourseId}`;

  const storedCourses: string[] = JSON.parse(localStorage.getItem(storedCoursesKey) || "[]");

  if (!storedCourses.includes(activeCourseId)) {
    storedCourses.push(activeCourseId);
    localStorage.setItem(storedCoursesKey, JSON.stringify(storedCourses));
  }

  const storedAssignments: string[] = JSON.parse(localStorage.getItem(storedAssignmentsKey) || "[]");

  if (!storedAssignments.includes(activeAssignmentId)) {
    storedAssignments.push(activeAssignmentId);
    localStorage.setItem(storedAssignmentsKey, JSON.stringify(storedAssignments));
  }

  const submissionsRaw = localStorage.getItem(submissionsKey);
  const rubricRaw = localStorage.getItem(rubricKey);

  const submissionsData: GroupedSubmissions = submissionsRaw
    ? (JSON.parse(submissionsRaw) as GroupedSubmissions)
    : {};
  const rubricData: Rubric | null = rubricRaw ? (JSON.parse(rubricRaw) as Rubric) : null;

  if (Object.keys(submissionsData).length === 0 || rubricData === null) {
    alert("No submissions or rubric found. Make sure grading data is available.");
    return;
  }

  localStorage.setItem(offlineSubmissionsKey, JSON.stringify(submissionsData));
  localStorage.setItem(offlineRubricKey, JSON.stringify(rubricData));
}
