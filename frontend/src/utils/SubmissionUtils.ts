import { Submission } from "palette-types";

export const calculateSubmissionTotal = (submission: Submission) => {
  // determine total score for the submission
  const { total } = Object.values(submission.rubricAssessment).reduce(
    (accumulator, assessment) => ({
      total: accumulator.total + assessment.points,
    }),
    { total: 0 },
  );

  return total;
};
