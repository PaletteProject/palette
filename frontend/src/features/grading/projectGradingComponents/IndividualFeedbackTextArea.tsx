import { Dispatch, SetStateAction } from "react";

interface IndividualFeedbackTextAreaProps {
  submissionId: number;
  individualFeedback: Record<number, string>;
  setIndividualFeedback: Dispatch<SetStateAction<Record<number, string>>>;
}

export function IndividualFeedbackTextArea({
  setIndividualFeedback,
  submissionId,
  individualFeedback,
}: IndividualFeedbackTextAreaProps) {
  return (
    <div className="w-full">
      <textarea
        className="w-full min-h-12 max-h-32 text-black font-bold rounded px-2 py-1 bg-gray-300 overflow-auto
          scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800"
        onChange={(e) => {
          setIndividualFeedback((prev) => ({
            ...prev,
            [submissionId]: e.target.value,
          }));
        }}
        value={individualFeedback[submissionId]}
        placeholder={"Enter feedback for the individual..."}
      />
    </div>
  );
}
