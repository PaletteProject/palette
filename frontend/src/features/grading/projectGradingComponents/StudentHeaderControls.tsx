import { calculateSubmissionTotal } from "../../../utils/SubmissionUtils.ts";
import { PaletteBrush, PaletteEye } from "@components";
import { ExistingIndividualFeedback } from "./ExistingIndividualFeedback.tsx";
import { IndividualFeedbackTextArea } from "./IndividualFeedbackTextArea.tsx";
import { Submission, SubmissionComment } from "palette-types";
import { Dispatch, SetStateAction, useState } from "react";

interface StudentHeaderControlsProps {
  submission: Submission;
  activeStudentId: number | null;
  setActiveStudentId: Dispatch<SetStateAction<number | null>>;
  existingIndividualFeedback: SubmissionComment[] | null;
  feedback: Record<number, string>;
  setFeedback: Dispatch<SetStateAction<Record<number, string>>>;
}

export function StudentHeaderControls({
  submission,
  activeStudentId,
  setActiveStudentId,
  existingIndividualFeedback,
  feedback,
  setFeedback,
}: StudentHeaderControlsProps) {
  const [showExistingIndividualFeedback, setShowExistingIndividualFeedback] =
    useState<boolean>(false);

  const [showIndividualFeedbackTextArea, setShowIndividualFeedbackTextArea] =
    useState<boolean>(false);

  return (
    <div className="flex flex-col w-full items-center gap-2">
      <div className="flex items-center justify-center gap-4 text-center">
        <div className={"flex justify-between"}>
          <p>{`${submission.user.name} (${submission.user.asurite})`}</p>
          <p>{`Average Score ${calculateSubmissionTotal(submission).toFixed(2)}`}</p>
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
          individualFeedback={feedback}
          setIndividualFeedback={setFeedback}
        />
      )}
    </div>
  );
}
