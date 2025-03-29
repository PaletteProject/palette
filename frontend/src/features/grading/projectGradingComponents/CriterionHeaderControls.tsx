import { PaletteBrush, PaletteEye } from "@components";
import { Dispatch, SetStateAction } from "react";
import { Criteria } from "palette-types";

interface CriterionHeaderControlsProps {
  activeCriterion: string | null;
  setActiveCriterion: Dispatch<SetStateAction<string | null>>;
  criterion: Criteria;
  setShowCriterionCommentTextArea: Dispatch<SetStateAction<boolean>>;
  setShowExistingCriterionComment: Dispatch<SetStateAction<boolean>>;
  showExistingCriterionComment: boolean;
  showCriterionCommentTextArea: boolean;
}

export function CriterionHeaderControls({
  activeCriterion,
  setActiveCriterion,
  criterion,
  setShowExistingCriterionComment,
  setShowCriterionCommentTextArea,
  showCriterionCommentTextArea,
  showExistingCriterionComment,
}: CriterionHeaderControlsProps) {
  return (
    <div>
      <div className="flex items-center gap-4 pr-4">
        <PaletteBrush
          onClick={() => {
            setActiveCriterion(
              activeCriterion === criterion.id ? null : criterion.id,
            );
            setShowCriterionCommentTextArea(true);
            setShowExistingCriterionComment(false);
          }}
          title="Add Criterion Comment"
          focused={
            showCriterionCommentTextArea && activeCriterion === criterion.id
          }
        />
        <PaletteEye
          onClick={() => {
            setActiveCriterion(
              activeCriterion === criterion.id ? null : criterion.id,
            );
            setShowExistingCriterionComment(true);
            setShowCriterionCommentTextArea(false);
          }}
          focused={
            showExistingCriterionComment && activeCriterion === criterion.id
          }
        />
      </div>
    </div>
  );
}
