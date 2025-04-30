import { Criteria, Submission, SubmissionComment } from "palette-types";
import { StudentHeaderControls } from "./StudentHeaderControls.tsx";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useMemo,
  useState,
} from "react";
import { useGradingContext, useRubric } from "@/context";
import { cn } from "@/lib/utils.ts";

interface GradingTableProps {
  submissions: Submission[];
  activeStudentId: number | null;
  setActiveStudentId: Dispatch<SetStateAction<number | null>>;
  existingIndividualFeedback: SubmissionComment[] | null;
}

export function GradingTable({
  submissions,
  activeStudentId,
  setActiveStudentId,
  existingIndividualFeedback,
}: GradingTableProps) {
  const { gradedSubmissionCache, updateScore } = useGradingContext();
  const { activeRubric } = useRubric();

  // locally track which criteria are group criterion
  const [groupCriteriaMap, setGroupCriteriaMap] = useState<
    Map<string, boolean>
  >(() => {
    const initial = new Map<string, boolean>();
    activeRubric.criteria.forEach((criterion) =>
      initial.set(criterion.id, criterion.isGroupCriterion),
    );
    return initial;
  });

  const toggleGroupCriterion = (id: string) => {
    setGroupCriteriaMap((prev) => {
      const newMap = new Map(prev); // copy existing map to ensure we update state
      newMap.set(id, !prev.get(id)); // update target entry with flipped value
      return newMap;
    });
  };

  const colorMap = useMemo(() => {
    const map = new Map<string, Record<number, string>>();
    activeRubric.criteria.forEach((criterion) => {
      const ratingPoints = criterion.ratings.map((r) => r.points);
      const highest = Math.max(...ratingPoints);
      const lowest = Math.min(...ratingPoints);

      const criterionColors: Record<number, string> = {};
      ratingPoints.forEach((points) => {
        if (points === highest) {
          criterionColors[points] = "bg-green-500";
        } else if (points === lowest) {
          criterionColors[points] = "bg-red-500";
        } else {
          criterionColors[points] = "bg-yellow-500";
        }
      });

      map.set(criterion.id, criterionColors);
    });

    return map;
  }, [activeRubric]);

  return (
    <div className="overflow-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800 relative">
      <table className="w-full table-fixed border-collapse border border-gray-500 text-left">
        <thead>
          <tr className="sticky top-0 bg-gray-500">
            <th className="w-auto border border-gray-500 px-4 py-2 truncate">
              Criteria
            </th>
            {submissions.map((submission: Submission) => (
              <th
                key={submission.id}
                className="border border-gray-500 px-4 py-2 w-auto"
              >
                <StudentHeaderControls
                  submission={submission}
                  activeStudentId={activeStudentId}
                  setActiveStudentId={setActiveStudentId}
                  existingIndividualFeedback={existingIndividualFeedback}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activeRubric.criteria.map((criterion: Criteria) => (
            <tr key={criterion.id}>
              <td className=" border border-gray-500 px-4 py-2 w-full">
                <p className="truncate overflow-hidden">
                  {criterion.description}
                </p>

                <label className="flex gap-2 text-sm font-medium whitespace-nowrap items-center mt-1">
                  <p>Apply to Group</p>
                  <input
                    type="checkbox"
                    name={`${criterion.id}-checkbox`}
                    id={`${criterion.id}-checkbox`}
                    checked={groupCriteriaMap.get(criterion.id) ?? false}
                    onChange={() => toggleGroupCriterion(criterion.id)}
                  />
                </label>
              </td>
              {submissions.map((submission: Submission) => {
                const submissionId = submission.id;
                const assessment =
                  gradedSubmissionCache[submissionId]?.rubric_assessment?.[
                    criterion.id
                  ];
                const currentValue = assessment?.points;
                const stringValue =
                  currentValue == null ? "" : String(currentValue);

                const handleRatingChange = (
                  e: ChangeEvent<HTMLSelectElement>,
                ) => {
                  const ratingStringValue = e.target.value;
                  console.log("rating change: score", ratingStringValue);
                  if (ratingStringValue == "") return; // skip updates if nothing selected

                  const newPoints = Number(ratingStringValue);

                  if (!groupCriteriaMap.get(criterion.id)) {
                    updateScore(submissionId, criterion.id, newPoints);
                  } else {
                    submissions.forEach((sub) => {
                      updateScore(sub.id, criterion.id, newPoints);
                    });
                  }
                };

                const bgColor =
                  stringValue !== ""
                    ? // user picked something → look up its color
                      (colorMap.get(criterion.id)?.[Number(stringValue)] ??
                      "bg-gray-800")
                    : // still on placeholder
                      "bg-gray-800";

                return (
                  <td
                    key={`${criterion.id}-${submission.id}`}
                    className="w-1/6 border border-gray-500 px-4 py-2 text-center"
                  >
                    <select
                      className={cn(
                        `w-full cursor-pointer text-white text-center rounded px-2 py-1 transition-colors duration-200 `,
                        `${bgColor}`,
                      )}
                      value={currentValue}
                      onChange={handleRatingChange}
                    >
                      <option value="" disabled>
                        Select a Rating
                      </option>
                      {criterion.ratings.map((rating) => (
                        <option value={rating.points} key={rating.key}>
                          {`${rating.description} - ${rating.points} Points`}
                        </option>
                      ))}
                    </select>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
