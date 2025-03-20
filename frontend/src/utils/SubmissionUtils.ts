import { Submission } from "palette-types";

export const calculateSubmissionTotal = (submission: Submission) => {
  if (!submission || !submission.rubricAssessment) return 0;
  // determine total score for the submission
  const { total } = Object.values(submission.rubricAssessment).reduce(
    (accumulator, assessment) => ({
      total: accumulator.total + assessment.points,
    }),
    { total: 0 },
  );

  return total;
};

export const calculateGroupAverage = (submissions: Submission[]): string => {
  if (!submissions) return String(0); // guard for empty submission collection

  let totalPoints = 0;
  let validSubmissionCount = 0;

  submissions.forEach((submission) => {
    if (!submission) return;

    if (submission.rubricAssessment) {
      totalPoints += calculateSubmissionTotal(submission);
      validSubmissionCount++;
    }
  });

  const average =
    validSubmissionCount > 0 ? totalPoints / validSubmissionCount : 0;
  console.log("sup", average);
  return average.toFixed(2);
};
