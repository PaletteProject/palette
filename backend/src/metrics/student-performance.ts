import { PaletteGradedSubmission, Submission } from "palette-types";

/**
 * Student Performance Metrics
 *
 * This module provides functions for calculating and analyzing student performance
 * based on their submissions and grades.
 */

/**
 * Calculate the total score for a submission
 * @param submission The graded submission to calculate the score for
 * @returns The total score as a number
 */
export function calculateSubmissionScore(
  submission: PaletteGradedSubmission
): number {
  if (!submission || !submission.rubric_assessment) return 0;

  return Object.values(submission.rubric_assessment).reduce(
    (total, assessment) => {
      return total + (assessment.points || 0);
    },
    0
  );
}
