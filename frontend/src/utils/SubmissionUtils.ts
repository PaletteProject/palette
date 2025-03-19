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

export const calculateGroupAverage = (submissions: Submission[]): number => {
  const { total, count } = submissions.reduce(
    (groupAcc, submission) => {
      // make sure submission has a rubric assessment, otherwise throw it out
      if (!submission.rubricAssessment)
        return {
          total: groupAcc.total,
          count: groupAcc.count,
        };
      // use reduce to aggregate scores for a single submission
      const { total: subTotal, count: subCount } = Object.values(
        submission.rubricAssessment,
      ).reduce(
        (acc, assessment) => ({
          total: acc.total + assessment.points,
          count: acc.count + 1,
        }),
        { total: 0, count: 0 }, // initial accumulator for a submission
      );

      // add submission total to group totals
      return {
        total: groupAcc.total + subTotal,
        count: groupAcc.count + subCount,
      };
    },
    { total: 0, count: 0 }, // initial accumulator for the group
  );
  return count > 0 ? total / count : 0;
};
