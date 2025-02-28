export function transferToOfflineGrading(
  activeCourseId: string,
  activeAssignmentId: string,
  rubricId: string
) {
  if (!activeCourseId || !activeAssignmentId || !rubricId) {
    alert("No course, assignment, or rubric selected.");
    return;
  }

  // Store active course and assignment for later retrieval
  localStorage.setItem("lastActiveCourse", activeCourseId);
  localStorage.setItem("lastActiveAssignment", activeAssignmentId);

  // Store available offline courses
  const storedCourses = JSON.parse(localStorage.getItem("offlineCourses") || "[]");
  if (!storedCourses.includes(activeCourseId)) {
    storedCourses.push(activeCourseId);
    localStorage.setItem("offlineCourses", JSON.stringify(storedCourses));
  }

  // Store available offline assignments for the selected course
  const storedAssignmentsKey = `offlineAssignments_${activeCourseId}`;
  const storedAssignments = JSON.parse(localStorage.getItem(storedAssignmentsKey) || "[]");
  if (!storedAssignments.includes(activeAssignmentId)) {
    storedAssignments.push(activeAssignmentId);
    localStorage.setItem(storedAssignmentsKey, JSON.stringify(storedAssignments));
  }

  // Define storage keys
  const gradesKey = `localGrades_${activeCourseId}_${activeAssignmentId}_rubric_${rubricId}`;
  const submissionsKey = `submissions_${activeCourseId}_${activeAssignmentId}`;
  const rubricKey = `rubric_${rubricId}`;

  // Define offline storage keys
  const offlineGradesKey = `offlineGrades_${activeCourseId}_${activeAssignmentId}_rubric_${rubricId}`;
  const offlineSubmissionsKey = `offlineSubmissions_${activeCourseId}_${activeAssignmentId}`;
  const offlineRubricKey = `offlineRubric_${rubricId}`;

  // Transfer Data
  localStorage.setItem(offlineGradesKey, localStorage.getItem(gradesKey) || "[]");
  localStorage.setItem(offlineSubmissionsKey, localStorage.getItem(submissionsKey) || "{}");
  localStorage.setItem(offlineRubricKey, localStorage.getItem(rubricKey) || "{}");

  alert("Grading data transferred to Offline Grading.");
}
