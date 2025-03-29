import { Submission } from "palette-types";

interface ExistingCriteriaCommentsProps {
  criterionId: string;
  submissions: Submission[];
  showExistingCriterionComment: boolean;
}

export function ExistingCriteriaComments({
  submissions,
  criterionId,
  showExistingCriterionComment,
}: ExistingCriteriaCommentsProps) {
  if (!showExistingCriterionComment) return null; // Only render if the section is active

  const existingCriterionComments = submissions[0].rubricAssessment
    ? Object.entries(submissions[0].rubricAssessment).reduce(
        (acc, [criterionId, criterion]) => {
          acc[criterionId] = criterion.comments;
          return acc;
        },
        {} as Record<string, string>,
      )
    : {};

  return (
    <div className="flex flex-col w-full gap-2">
      {existingCriterionComments[criterionId] ? (
        <>
          <h2 className="text-lg font-bold">Existing Criterion Comments</h2>
          <ul className="list-disc list-inside">
            <li key={criterionId}>{existingCriterionComments[criterionId]}</li>
          </ul>
        </>
      ) : (
        <p>No existing comments for this criterion</p>
      )}
    </div>
  );
}
