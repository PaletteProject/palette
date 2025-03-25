import { Dispatch, SetStateAction } from "react";

interface IndividualFeedbackTextAreaProps {
  submissionId: number;
  feedback: Record<number, string>;
  setFeedback: Dispatch<SetStateAction<Record<number, string>>>;
}

export function IndividualFeedbackTextArea({
  setFeedback,
  submissionId,
  feedback,
}: IndividualFeedbackTextAreaProps) {
  return (
    <div className="w-full">
      <textarea
        className="w-full min-h-12 max-h-32 text-black font-bold rounded px-2 py-1 bg-gray-300 overflow-auto
          scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800"
        onChange={(e) => {
          setFeedback((prev) => ({
            ...prev,
            [submissionId]: e.target.value,
          }));
        }}
        value={feedback[submissionId]}
        placeholder={"Enter feedback for the individual..."}
      />
    </div>
  );
}
