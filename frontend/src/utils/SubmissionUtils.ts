import { PaletteGradedSubmission, Submission } from "palette-types";
import { SavedGrades } from "@/context";

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
  submissions: SavedGrades,
  groupSubmissionIds: number[],
): number => {
  if (!submissions) return 0; // guard for empty submission collection

  let totalPoints = 0;
  let validSubmissionCount = 0;

  Object.values(submissions).forEach((submission) => {
    if (!submission) return;

    if (!groupSubmissionIds.some((id) => submission.submission_id === id))
      return; // skip if not in target group

    if (submission.rubric_assessment) {
      totalPoints += calculateSubmissionTotal(submission);
      validSubmissionCount += 1;
    }
  });

  return validSubmissionCount > 0 ? totalPoints / validSubmissionCount : 0;
};

// helper function for calculating the initial group avg based on canvas data
export const calculateCanvasGroupAverage = (
  submissions: Submission[],
): number => {
  if (!submissions || submissions.length === 0) return 0;

  let totalPoints = 0;
  let totalCount = 0;

  submissions.forEach((submission) => {
    if (submission.rubricAssessment) {
      const { sum } = Object.values(submission.rubricAssessment).reduce(
        (acc, rating) => {
          const points = Number(rating.points);
          if (!isNaN(points)) {
            return {
              sum: acc.sum + points,
            };
          }
          return acc;
        },
        { sum: 0 },
      );

      totalPoints += sum;
      totalCount += 1;
    }
  });

  if (totalCount === 0) return 0;

  return totalPoints / totalCount;
};
