export function transferToOfflineGrading(
  activeCourseId: string,
  activeAssignmentId: string,
  rubricId: string
) {
  if (!activeCourseId || !activeAssignmentId || !rubricId) {
    alert("No course, assignment, or rubric selected.");
    return;
  }

  console.log("🔄 Starting offline transfer...");
  console.log("📥 Checking existing data before transfer:");

  console.log("Submissions:", localStorage.getItem(`submissions_${activeCourseId}_${activeAssignmentId}`));
  console.log("Rubric:", localStorage.getItem(`rubric_${rubricId}`));

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
  const submissionsKey = `submissions_${activeCourseId}_${activeAssignmentId}`;
  const rubricKey = `rubric_${rubricId}`;

  // Define offline storage keys
  const offlineSubmissionsKey = `offlineSubmissions_${activeCourseId}_${activeAssignmentId}`;
  const offlineRubricKey = `offlineRubric_${activeCourseId}_${activeAssignmentId}`;

  // 🔍 Debugging logs before storing
  console.log("📤 Attempting to store data...");
  console.log("Saving to:", offlineSubmissionsKey, "Data:", localStorage.getItem(submissionsKey));
  console.log("Saving to:", offlineRubricKey, "Data:", localStorage.getItem(rubricKey));

  // Transfer Data
  localStorage.setItem(offlineSubmissionsKey, localStorage.getItem(submissionsKey) || "{}");
  localStorage.setItem(offlineRubricKey, localStorage.getItem(rubricKey) || "null");

  console.log("✅ Offline grading data transferred.");
}
