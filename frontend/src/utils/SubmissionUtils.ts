import { PaletteGradedSubmission, Submission } from "palette-types";

export const calculateSubmissionTotal = (
  submission: PaletteGradedSubmission | Submission,
) => {
  if (!submission) return 0;

  // narrow to the provided type
  const assessment =
    "rubric_assessment" in submission
      ? submission.rubric_assessment
      : "rubricAssessment" in submission
        ? submission.rubricAssessment
        : null;

  if (!assessment) return 0;

  // determine total score for the submission
  const { sum, count } = Object.values(assessment).reduce(
    (accumulator, assessment) => ({
      sum: accumulator.sum + assessment.points,
      count: accumulator.count + 1,
    }),
    { sum: 0, count: 0 },
  );

  return sum / count;
};

//todo: update to properly display current group avg score
// potentially just go back to canvas scores for this one?

// grading cache is all scores for one group (unique to each project grading view instance)
export const calculateGroupAverage = (
  submissions: Record<number, PaletteGradedSubmission>,
): string => {
  if (!submissions) return String(0); // guard for empty submission collection

  let totalPoints = 0;
  let validSubmissionCount = 0;

  Object.values(submissions).forEach((submission) => {
    if (!submission) return;

    if (submission.rubric_assessment) {
      totalPoints += calculateSubmissionTotal(submission);
      validSubmissionCount++;
    }
  });

  const average =
    validSubmissionCount > 0 ? totalPoints / validSubmissionCount : 0;
  return average.toFixed(2);
};
