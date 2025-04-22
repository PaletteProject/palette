import { Dispatch, SetStateAction } from "react";
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
  setGradedSubmissionCache: Dispatch<SetStateAction<Record<number, CanvasGradedSubmission>>>,
  selectedCourse: string | null,
  selectedAssignment: string | null,
) {
  if (!selectedCourse?.trim() || !selectedAssignment?.trim()) {
    alert("Please select a course and assignment before transferring.");
    return;
  }

  const scopedKey = `offlineGradingCache_${selectedCourse}_${selectedAssignment}`;
  const savedOfflineGrades = safeParse<Record<number, CanvasGradedSubmission>>(
    localStorage.getItem(scopedKey),
    {},
  );

  if (!Object.keys(savedOfflineGrades).length) {
    alert("No offline grades found to transfer.");
    return;
  }

  localStorage.setItem(
    "tokenGradedSubmissionCache",
    JSON.stringify(savedOfflineGrades),
  );

  // Update the in-memory cache for token-based grading
  setGradedSubmissionCache(savedOfflineGrades);

  alert("Offline grades transferred to Token-Based Grading!");
}
