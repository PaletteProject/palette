import { Dispatch, SetStateAction } from "react";
import { PaletteGradedSubmission } from "palette-types";

export function transferOfflineToTokenGrading(
  setGradedSubmissionCache: Dispatch<SetStateAction<PaletteGradedSubmission[]>>,
  selectedCourse: string,
  selectedAssignment: string,
) {
  if (!selectedCourse?.trim() || !selectedAssignment?.trim()) {
    alert("Please select a course and assignment before transferring.");
    return;
  }

 
  const scopedKey = `offlineGradingCache_${selectedCourse}_${selectedAssignment}`;
  const fallbackKey = "offlineGradingCache";

  let savedOfflineGrades = localStorage.getItem(scopedKey);

 
  if (!savedOfflineGrades) {
    savedOfflineGrades = localStorage.getItem(fallbackKey);
  }

  if (!savedOfflineGrades) {
    alert("No offline grades found for this course and assignment.");
    return;
  }

  const parsedOfflineGrades: PaletteGradedSubmission[] =
    JSON.parse(savedOfflineGrades);

  setGradedSubmissionCache((prev) => {
    const updatedCache = [...prev];

    parsedOfflineGrades.forEach((offlineSubmission) => {
      const index = updatedCache.findIndex(
        (s) => s.submission_id === offlineSubmission.submission_id,
      );

      if (index > -1) {
        updatedCache[index] = offlineSubmission;
      } else {
        updatedCache.push(offlineSubmission);
      }
    });

    return updatedCache;
  });

  alert(
    "Offline grades have been successfully transferred to Token-Based Grading!",
  );
}
