interface IndividualFeedbackTextAreaProps {
  submissionId: number;
  individualFeedback: Record<number, string>;
  setIndividualFeedback: (text: string) => void;
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
        onChange={(event) => {
          setIndividualFeedback(event.target.value);
        }}
        value={individualFeedback[submissionId]}
        placeholder={"Enter feedback for the individual..."}
      />
    </div>
  );
}
