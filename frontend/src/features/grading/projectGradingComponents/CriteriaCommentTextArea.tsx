import { Dispatch, SetStateAction } from "react";

interface CriterionCommentTextAreaProps {
  criterionId: string;
  criterionComments: Record<string, string>;
  setCriterionComments: Dispatch<SetStateAction<Record<string, string>>>;
}

export function CriteriaCommentTextArea({
  criterionId,
  setCriterionComments,
  criterionComments,
}: CriterionCommentTextAreaProps) {
  return (
    <div className="flex flex-col w-full gap-2 ">
      <textarea
        className="w-full min-h-12 max-h-32 text-black font-bold rounded px-2 py-1 bg-gray-300 overflow-auto
          scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800"
        onChange={(e) =>
          setCriterionComments((prev) => ({
            ...prev,
            [criterionId]: e.target.value,
          }))
        }
        value={criterionComments[criterionId] || ""}
        placeholder="Enter comment for the criterion..."
      />
    </div>
  );
}
