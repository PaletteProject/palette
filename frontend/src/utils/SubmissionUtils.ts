import { Submission } from "palette-types";

export const calculateSubmissionTotal = (submission: Submission) => {
  if (!submission || !submission.rubricAssessment) return 0;
  // determine total score for the submission
  const { sum, count } = Object.values(submission.rubricAssessment).reduce(
    (accumulator, assessment) => ({
      sum: accumulator.sum + assessment.points,
      count: accumulator.count + 1,
    }),
    { sum: 0, count: 0 },
  );

  return sum / count;
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
