import { useGradingContext } from "../../../context/GradingContext.tsx";

export function GroupFeedback() {
  const { gradedSubmissionCache, updateGroupComment } = useGradingContext();

  return (
    <div className="flex flex-col gap-2">
      <textarea
        className="w-1/3 min-h-12 max-h-32 text-black font-bold rounded px-2 py-1 bg-gray-300 overflow-auto
        scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800"
        onChange={(e) => updateGroupComment(e.target.value)}
        value={
          Object.values(gradedSubmissionCache)[0].group_comment?.text_comment ??
          ""
        }
        placeholder="Enter feedback for the group..."
      />
    </div>
  );
}
