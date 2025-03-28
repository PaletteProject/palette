import { PaletteGradedSubmission } from "palette-types";

// calculate the total score of a target submission
export const calculateSubmissionTotal = (
  submission: PaletteGradedSubmission,
) => {
  if (!submission) return 0;

  // determine total score for the submission
  const { sum } = Object.values(submission.rubric_assessment).reduce(
    (accumulator, assessment) => {
      if (Number(assessment.points)) {
        // treat ""/empty ratings as zero
        return {
          sum: accumulator.sum + assessment.points,
        };
      } else {
        return {
          sum: accumulator.sum,
        };
      }
    },
    { sum: 0 },
  );

  return sum;
};

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
      validSubmissionCount += 1;
    }
  });

  const average =
    validSubmissionCount > 0 ? totalPoints / validSubmissionCount : 0;
  return average.toFixed(2);
};
