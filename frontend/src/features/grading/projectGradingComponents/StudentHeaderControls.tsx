import { PaletteBrush, PaletteEye } from "@components";
import { ExistingIndividualFeedback } from "./ExistingIndividualFeedback.tsx";
import { IndividualFeedbackTextArea } from "./IndividualFeedbackTextArea.tsx";
import {
  PaletteGradedSubmission,
  Submission,
  SubmissionComment,
} from "palette-types";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface StudentHeaderControlsProps {
  submission: Submission;
  activeStudentId: number | null;
  setActiveStudentId: Dispatch<SetStateAction<number | null>>;
  existingIndividualFeedback: SubmissionComment[] | null;
  gradedSubmissionCache: Record<number, PaletteGradedSubmission>;
  setGradedSubmissionCache: Dispatch<
    SetStateAction<Record<number, PaletteGradedSubmission>>
  >;
}

export function StudentHeaderControls({
  submission,
  activeStudentId,
  setActiveStudentId,
  existingIndividualFeedback,
  gradedSubmissionCache,
  setGradedSubmissionCache,
}: StudentHeaderControlsProps) {
  const [showExistingIndividualFeedback, setShowExistingIndividualFeedback] =
    useState<boolean>(false);

  const [showIndividualFeedbackTextArea, setShowIndividualFeedbackTextArea] =
    useState<boolean>(false);

  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    const graded = gradedSubmissionCache[submission.id];
    if (!graded || !graded.rubric_assessment) return;

    let total = 0;

    Object.values(graded.rubric_assessment).forEach((assessment) => {
      if (assessment.points) {
        total += assessment.points;
      }
    });

    setScore(total);
  }, [gradedSubmissionCache, submission.id]);

  const handleFeedbackChange = (text: string) => {
    setGradedSubmissionCache((prev) => ({
      ...prev,
      [submission.id]: {
        ...prev[submission.id],
        individual_comment: text
          ? {
              text_comment: text,
              group_comment: false,
            }
          : undefined,
      },
    }));
  };

  const currentFeedback =
    gradedSubmissionCache[submission.id]?.individual_comment?.text_comment ??
    "";

  return (
    <div className="flex flex-col w-full items-center gap-2">
      <div className="flex items-center justify-center gap-4 text-center">
        <div className={"flex justify-between"}>
          <p>{`${submission.user.name} (${submission.user.asurite})`}</p>
          <p>{`Score ${score.toFixed(2)}`}</p>
        </div>
        <PaletteBrush
          onClick={() => {
            setActiveStudentId(
              activeStudentId === submission.id ? null : submission.id,
            );
            setShowIndividualFeedbackTextArea(true);
            setShowExistingIndividualFeedback(false);
          }}
          title="Add Feedback"
          focused={
            showIndividualFeedbackTextArea && activeStudentId === submission.id
          }
        />
        <PaletteEye
          onClick={() => {
            setActiveStudentId((prev) =>
              prev === submission.id ? null : submission.id,
            );
            setShowExistingIndividualFeedback(true);
            setShowIndividualFeedbackTextArea(false);
          }}
          focused={
            showExistingIndividualFeedback && activeStudentId === submission.id
          }
        />
      </div>
      {showExistingIndividualFeedback && (
        <ExistingIndividualFeedback
          activeStudentId={activeStudentId}
          submissionId={submission.id}
          existingFeedback={existingIndividualFeedback}
        />
      )}
      {activeStudentId === submission.id && showIndividualFeedbackTextArea && (
        <IndividualFeedbackTextArea
          submissionId={submission.id}
          individualFeedback={currentFeedback}
          setIndividualFeedback={handleFeedbackChange}
        />
      )}
    </div>
  );
}
