import { CanvasGradedSubmission } from "palette-types";

function safeParse<T>(data: string | null, fallback: T): T {
  try {
    return data ? (JSON.parse(data) as T) : fallback;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return fallback;
  }
}

export function aggregateOfflineGrades(
  courseId: string,
  assignmentId: string,
): Record<number, CanvasGradedSubmission> {
  const aggregatedGrades: Record<number, CanvasGradedSubmission> = {};

  const scopedKey = `offlineGradingCache_${courseId}_${assignmentId}`;
  const fallbackKey = "offlineGradingCache";

  const scopedGrades = safeParse<Record<number, CanvasGradedSubmission>>(
    localStorage.getItem(scopedKey),
    {},
  );
  Object.assign(aggregatedGrades, scopedGrades);

  // Fallback general cache
  if (Object.keys(aggregatedGrades).length === 0) {
    const fallbackGrades = safeParse<Record<number, CanvasGradedSubmission>>(
      localStorage.getItem(fallbackKey),
      {},
    );
    Object.assign(aggregatedGrades, fallbackGrades);
  }

  // Check group-scoped keys too
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key &&
      key.startsWith(`offlineGradingCache_${courseId}_${assignmentId}_`)
    ) {
      const groupGrades = safeParse<Record<number, CanvasGradedSubmission>>(
        localStorage.getItem(key),
        {},
      );
      Object.assign(aggregatedGrades, groupGrades);
    }
  }

  return aggregatedGrades;
}
