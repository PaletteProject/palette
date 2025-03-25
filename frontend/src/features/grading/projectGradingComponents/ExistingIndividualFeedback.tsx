import { SubmissionComment } from "palette-types";

interface ExistingIndividualFeedbackProps {
  activeStudentId: number | null;
  submissionId: number;
  existingFeedback: SubmissionComment[] | null;
}

export function ExistingIndividualFeedback({
  activeStudentId,
  submissionId,
  existingFeedback,
}: ExistingIndividualFeedbackProps) {
  if (!activeStudentId || activeStudentId !== submissionId || !existingFeedback)
    return null;
  return (
    <div className="w-full">
      <>
        {existingFeedback.length > 0 ? (
          <>
            <h2 className="text-lg font-bold">Existing Comments</h2>
            <ul className="list-disc list-inside">
              {existingFeedback.map((comment) => (
                <li>{comment.comment}</li>
              ))}
            </ul>
          </>
        ) : (
          <p>No existing comments for this student</p>
        )}
      </>
      )
    </div>
  );
}
