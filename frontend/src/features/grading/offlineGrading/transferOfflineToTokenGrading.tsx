// utils/transferOfflineToTokenGrading.ts
import { CanvasGradedSubmission } from "palette-types";

function safeParse<T>(data: string | null, fallback: T): T {
  try {
    return data ? (JSON.parse(data) as T) : fallback;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return fallback;
  }
}
export function transferOfflineToTokenGrading(
  courseId: string,
  assignmentId: string,
): void {
  const baseKey = `offlineGradingCache_${courseId}_${assignmentId}`;
  const fallbackKey = "offlineGradingCache";

  const aggregatedGrades: Record<number, CanvasGradedSubmission> = {};

  // Pull base cache if present
  const baseGrades = safeParse<Record<number, CanvasGradedSubmission>>(
    localStorage.getItem(baseKey),
    {},
  );
  Object.assign(aggregatedGrades, baseGrades);

  // Pull fallback if base not present
  if (Object.keys(aggregatedGrades).length === 0) {
    const fallbackGrades = safeParse<Record<number, CanvasGradedSubmission>>(
      localStorage.getItem(fallbackKey),
      {},
    );
    Object.assign(aggregatedGrades, fallbackGrades);
  }

  // Fallback to group-specific keys as a last resort
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`${baseKey}_`)) {
      const groupGrades = safeParse<Record<number, CanvasGradedSubmission>>(
        localStorage.getItem(key),
        {},
      );
      Object.assign(aggregatedGrades, groupGrades);
    }
  }

  if (Object.keys(aggregatedGrades).length === 0) {
    alert("No offline grades found to transfer.");
    return;
  }

  localStorage.setItem(
    "tokenGradedSubmissionCache",
    JSON.stringify(aggregatedGrades),
  );

  alert("All offline grades transferred to Token-Based Grading!");
}
