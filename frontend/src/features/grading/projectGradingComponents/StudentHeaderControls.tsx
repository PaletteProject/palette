import { PaletteBrush, PaletteEye } from "@/components";
import { ExistingIndividualFeedback } from "./ExistingIndividualFeedback.tsx";
import { IndividualFeedbackTextArea } from "./IndividualFeedbackTextArea.tsx";
import { Submission, SubmissionComment } from "palette-types";
import { Dispatch, SetStateAction, useState } from "react";
import { useGradingContext } from "@/context";
import { calculateSubmissionTotal } from "@/utils";

interface StudentHeaderControlsProps {
  submission: Submission;
  activeStudentId: number | null;
  setActiveStudentId: Dispatch<SetStateAction<number | null>>;
  existingIndividualFeedback: SubmissionComment[] | null;
}

export function StudentHeaderControls({
  submission,
  activeStudentId,
  setActiveStudentId,
  existingIndividualFeedback,
}: StudentHeaderControlsProps) {
  const [showExistingIndividualFeedback, setShowExistingIndividualFeedback] =
    useState(false);

  const [showIndividualFeedbackTextArea, setShowIndividualFeedbackTextArea] =
    useState(false);

  const { gradedSubmissionCache } = useGradingContext();

  const isActive = activeStudentId === submission.id;

  const handleBrushClick = () => {
    setActiveStudentId(isActive ? null : submission.id);
    setShowIndividualFeedbackTextArea(true);
    setShowExistingIndividualFeedback(false);
  };

  const handleEyeClick = () => {
    setActiveStudentId(isActive ? null : submission.id);
    setShowExistingIndividualFeedback(true);
    setShowIndividualFeedbackTextArea(false);
  };

  return (
    <div className="flex flex-col items-center text-sm gap-2 px-2 relative">
      {/* Header: Name + Score */}
      <div className="text-center leading-tight space-y-0.5 max-w-32">
        <p className="font-semibold">{submission.user.name}</p>
        <p className="text-xs text-gray-300 truncate overflow-hidden">
          {submission.user.asurite}
        </p>
        <p className="text-xs text-gray-400">
          Score:{" "}
          {calculateSubmissionTotal(gradedSubmissionCache[submission.id])}
        </p>
      </div>

      {/* Icons */}
      <div className="flex gap-2 items-center absolute top-0 right-0">
        <PaletteBrush
          onClick={handleBrushClick}
          title="Add Feedback"
          focused={showIndividualFeedbackTextArea && isActive}
        />
        <PaletteEye
          onClick={handleEyeClick}
          focused={showExistingIndividualFeedback && isActive}
        />
      </div>

      {/* Feedback areas */}
      {showExistingIndividualFeedback && (
        <ExistingIndividualFeedback
          activeStudentId={activeStudentId}
          submissionId={submission.id}
          existingFeedback={existingIndividualFeedback}
        />
      )}
      {isActive && showIndividualFeedbackTextArea && (
        <IndividualFeedbackTextArea submissionId={submission.id} />
      )}
    </div>
  );
}
