import {
  Criteria,
  PaletteGradedSubmission,
  Submission,
  SubmissionComment,
  Rubric,
} from "palette-types";
import { StudentHeaderControls } from "./StudentHeaderControls";
import { ExistingCriteriaComments } from "./ExistingCriteriaComments";
import { CriterionHeaderControls } from "./CriterionHeaderControls";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { TableRatingOptions } from "./TableRatingOptions";
import { useGradingContext } from "../../../context/GradingContext";
import { useRubric } from "@context";


interface GradingTableProps {
  submissions: Submission[];
  activeStudentId: number | null;
  setActiveStudentId: Dispatch<SetStateAction<number | null>>;
  existingIndividualFeedback: SubmissionComment[] | null;
  setSavedGrades: Dispatch<
    SetStateAction<Record<number, PaletteGradedSubmission>>
  >;
  rubric: Rubric; 
}

export function GradingTable({
  submissions,
  activeStudentId,
  setActiveStudentId,
  existingIndividualFeedback,
  setSavedGrades,
  rubric,
}: GradingTableProps) {
  const [activeCriterion, setActiveCriterion] = useState<string | null>(null);
  const [showExistingCriterionComment, setShowExistingCriterionComment] =
    useState<boolean>(false);
  const [showCriterionCommentTextArea, setShowCriterionCommentTextArea] =
    useState<boolean>(false);

  const { gradedSubmissionCache, updateScore } = useGradingContext();
  const { activeRubric } = useRubric();

  const currentRubric = rubric ?? activeRubric;

  const getBackgroundColor = (
    value: number | string,
    criterion: Criteria,
  ): string => {
    if (value === "") return "bg-gray-800";
    const highest = Math.max(...criterion.ratings.map((r) => r.points));
    const lowest = Math.min(...criterion.ratings.map((r) => r.points));

    if (value === highest) return "bg-green-500";
    if (value === lowest) return "bg-red-500";
    return "bg-yellow-500";
  };

  useEffect(() => {
    setSavedGrades((existingGrades) => ({
      ...existingGrades,
      ...gradedSubmissionCache,
    }));
  }, [gradedSubmissionCache]);

  return (
    <div className="overflow-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800 relative">
      <table className="w-full table-auto border-collapse border border-gray-500 text-left">
        <thead>
          <tr className="sticky top-0 bg-gray-500">
            <th className="border border-gray-500 px-4 py-2">Criteria</th>
            {submissions.map((submission: Submission) => (
              <th
                key={submission.id}
                className="border border-gray-500 px-4 py-2"
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
          {currentRubric.criteria.map((criterion: Criteria) => (
            <tr key={criterion.id}>
              <td className="border border-gray-500 px-4 py-2">
                <div className="flex justify-between items-center gap-6">
                  <p className="flex-1">{criterion.description}</p>
                  {showExistingCriterionComment &&
                    activeCriterion === criterion.id && (
                      <ExistingCriteriaComments
                        criterionId={criterion.id}
                        submissions={submissions}
                        showExistingCriterionComment={
                          showExistingCriterionComment
                        }
                      />
                    )}
                  <TableRatingOptions criterion={criterion} />
                  <CriterionHeaderControls
                    activeCriterion={activeCriterion}
                    setActiveCriterion={setActiveCriterion}
                    criterion={criterion}
                    setShowCriterionCommentTextArea={
                      setShowCriterionCommentTextArea
                    }
                    setShowExistingCriterionComment={
                      setShowExistingCriterionComment
                    }
                    showExistingCriterionComment={showExistingCriterionComment}
                    showCriterionCommentTextArea={showCriterionCommentTextArea}
                  />
                </div>
              </td>
              {submissions.map((submission: Submission) => {
                const submissionId = submission.id;
                const assessment =
                  gradedSubmissionCache[submissionId]?.rubric_assessment?.[
                    criterion.id
                  ];
                const currentValue = assessment?.points ?? "";

                const handleRatingChange = (e: ChangeEvent<HTMLSelectElement>) => {
                  const newPoints = Number(e.target.value);
                  const storageKey = `criterion-${criterion.id}-isGroupCriterion`;
                  const isGroupCriterion = JSON.parse(window.localStorage.getItem(storageKey) || 'false');
                
                  if (!isGroupCriterion) {
                    updateScore(submissionId, criterion.id, newPoints);
                  } else {
                    submissions.forEach((sub) => {
                      updateScore(sub.id, criterion.id, newPoints);
                    });
                  }
                };
                

                return (
                  <td
                    key={`${criterion.id}-${submission.id}`}
                    className="w-1/6 border border-gray-500 px-4 py-2 text-center"
                  >
                    <select
                      className={`w-full text-white text-center rounded px-2 py-1 ${getBackgroundColor(
                        currentValue,
                        criterion,
                      )}`}
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
