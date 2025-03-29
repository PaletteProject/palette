import { useGradingContext } from "../../../context/GradingContext.tsx";

interface IndividualFeedbackTextAreaProps {
  submissionId: number;
}

export function IndividualFeedbackTextArea({
  submissionId,
}: IndividualFeedbackTextAreaProps) {
  const { gradedSubmissionCache, updateComment } = useGradingContext();

  return (
    <div className="w-full">
      <textarea
        className="w-full min-h-12 max-h-32 text-black font-bold rounded px-2 py-1 bg-gray-300 overflow-auto
          scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800"
        onChange={(event) => {
          updateComment(submissionId, event.target.value);
        }}
        value={
          gradedSubmissionCache[submissionId].individual_comment
            ?.text_comment ?? ""
        }
        placeholder={"Enter feedback for the individual..."}
      />
    </div>
  );
}
