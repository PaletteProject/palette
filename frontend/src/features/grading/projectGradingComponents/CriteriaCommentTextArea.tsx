import { useGradingContext } from "../../../context/GradingContext.tsx";

interface CriterionCommentTextAreaProps {
  criterionId: string;
  submissionId: number;
}

export function CriteriaCommentTextArea({
  criterionId,
  submissionId,
}: CriterionCommentTextAreaProps) {
  const { updateComment, gradedSubmissionCache } = useGradingContext();

  return (
    <div className="flex flex-col w-full gap-2 ">
      <textarea
        className="w-full min-h-12 max-h-32 text-black font-bold rounded px-2 py-1 bg-gray-300 overflow-auto
          scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800"
        onChange={(event) => updateComment(submissionId, event.target.value)}
        value={
          gradedSubmissionCache[submissionId].rubric_assessment[criterionId]
            .comments || ""
        }
        placeholder="Enter comment for the criterion..."
      />
    </div>
  );
}
