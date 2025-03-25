type GroupFeedbackProps = {
  groupFeedback: string;
  setGroupFeedback: (text: string) => void;
};

export function GroupFeedback({
  groupFeedback,
  setGroupFeedback,
}: GroupFeedbackProps) {
  return (
    <div className="flex flex-col gap-2">
      <textarea
        className="w-1/3 min-h-12 max-h-32 text-black font-bold rounded px-2 py-1 bg-gray-300 overflow-auto
        scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800"
        onChange={(e) => setGroupFeedback(e.target.value)}
        value={groupFeedback}
        placeholder="Enter feedback for the group..."
      />
    </div>
  );
}
