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
  const rubricId = String(rubric?.id);

  if (!activeCourseId || !activeAssignmentId || !rubric || !rubricId) {
    alert("Missing course, assignment, or rubric.");
    return;
  }

  const submissionsKey = `submissions_${activeCourseId}_${activeAssignmentId}`;
  const rubricKey = `rubric_${rubricId}`;
  const offlineSubmissionsKey = `offlineSubmissions_${activeCourseId}_${activeAssignmentId}`;
  const offlineRubricKey = `offlineRubric_${activeCourseId}_${activeAssignmentId}`;
  const courseNameMapKey = "courseNameMap";
  const assignmentNameMapKey = `assignmentNameMap_${activeCourseId}`;

  // 🧠 Save course name mapping
  const courseNameMap: Record<string, string> = safeParse(
    localStorage.getItem(courseNameMapKey),
    {},
  );
  courseNameMap[activeCourseId] = activeCourse.name;
  localStorage.setItem(courseNameMapKey, JSON.stringify(courseNameMap));

  // 🧠 Save assignment name mapping
  const assignmentNameMap: Record<string, string> = safeParse(
    localStorage.getItem(assignmentNameMapKey),
    {},
  );
  assignmentNameMap[activeAssignmentId] = activeAssignment.name;
  localStorage.setItem(assignmentNameMapKey, JSON.stringify(assignmentNameMap));

  // 🧠 Add course & assignment to offline list
  const storedCourses: string[] = safeParse(
    localStorage.getItem("offlineCourses"),
    [],
  );
  if (!storedCourses.includes(activeCourseId)) {
    storedCourses.push(activeCourseId);
    localStorage.setItem("offlineCourses", JSON.stringify(storedCourses));
  }

  const storedAssignments: string[] = safeParse(
    localStorage.getItem(`offlineAssignments_${activeCourseId}`),
    [],
  );
  if (!storedAssignments.includes(activeAssignmentId)) {
    storedAssignments.push(activeAssignmentId);
    localStorage.setItem(
      `offlineAssignments_${activeCourseId}`,
      JSON.stringify(storedAssignments),
    );
  }

  // 💾 Pull data
  const submissionsRaw = localStorage.getItem(submissionsKey);
  const rubricRaw = localStorage.getItem(rubricKey);

  const submissionsData: GroupedSubmissions = submissionsRaw
    ? safeParse(submissionsRaw, {})
    : {};

  // 👇 Ensure `isGroupCriterion` flags are preserved
  const rubricData: Rubric = rubricRaw
    ? safeParse(rubricRaw, rubric)
    : {
        ...rubric,
        criteria: rubric.criteria.map((c) => ({
          ...c,
          isGroupCriterion: c.isGroupCriterion ?? false,
        })),
      };

  if (Object.keys(submissionsData).length === 0 || !rubricData) {
    alert("No submissions or rubric found. Make sure grading data is available.");
    return;
  }

  // ✅ Save offline grading content
  localStorage.setItem(offlineSubmissionsKey, JSON.stringify(submissionsData));
  localStorage.setItem(offlineRubricKey, JSON.stringify(rubricData));
  localStorage.setItem("offlineTransferPushRequired", "true");

  // 🔄 Mirror to token cache in case of fallback
  localStorage.setItem(
    "tokenGradedSubmissionCache",
    localStorage.getItem("offlineGradingCache") || "[]",
  );

  alert("✅ Transferred to Offline Grading.");
}
