import { GroupedSubmissions, Rubric, Submission, CanvasGradedSubmission } from "palette-types";

export function transferToOfflineGrading(
  activeCourseId: string,
  activeAssignmentId: string,
  rubricId: string
) {
  console.log("Starting offline transfer...");
  console.log("Course ID:", activeCourseId);
  console.log("Assignment ID:", activeAssignmentId);
  console.log("Rubric ID:", rubricId);

  if (!activeCourseId || !activeAssignmentId || !rubricId) {
    alert("No course, assignment, or rubric selected.");
    return;
  }

  const submissionsKey = `submissions_${activeCourseId}_${activeAssignmentId}`;
  const rubricKey = `rubric_${rubricId}`;

  const offlineSubmissionsKey = `offlineSubmissions_${activeCourseId}_${activeAssignmentId}`;
  const offlineRubricKey = `offlineRubric_${activeCourseId}_${activeAssignmentId}`;

  console.log("Fetching stored submissions:", localStorage.getItem(submissionsKey));
  console.log("Fetching stored rubric:", localStorage.getItem(rubricKey));

  const submissionsData = JSON.parse(localStorage.getItem(submissionsKey) || "{}");
  const rubricData = JSON.parse(localStorage.getItem(rubricKey) || "null");

  if (!submissionsData || !rubricData) {
    alert("No submissions or rubric found. Make sure grading data is available.");
    return;
  }

  // ✅ Ensure submissions are grouped correctly before saving
  const groupedSubmissions: GroupedSubmissions = submissionsData;

  localStorage.setItem(offlineSubmissionsKey, JSON.stringify(groupedSubmissions));
  localStorage.setItem(offlineRubricKey, JSON.stringify(rubricData));

  console.log("✅ Grading data successfully transferred to offline storage.");
}
