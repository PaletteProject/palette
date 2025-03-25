import { Submission, SubmissionComment } from "palette-types";

interface ExistingGroupFeedbackProps {
  submissions: Submission[];
  getExistingGroupFeedback: (submissions: Submission[]) => SubmissionComment[];
}

export function ExistingGroupFeedback({
  submissions,
  getExistingGroupFeedback,
}: ExistingGroupFeedbackProps) {
  return (
    <div className="flex flex-col gap-2">
      {getExistingGroupFeedback(submissions).length > 0 ? (
        <>
          <h2 className="text-lg font-bold">Existing Group Comments</h2>
          <ul className="list-disc list-inside">
            {getExistingGroupFeedback(submissions).map((comment) => (
              <li key={comment.id}>{comment.comment}</li>
            ))}
          </ul>
        </>
      ) : (
        <p>No existing group comments</p>
      )}
    </div>
  );
}
