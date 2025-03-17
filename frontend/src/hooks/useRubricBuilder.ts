import { useAssignment, useChoiceDialog, useCourse, useRubric } from "@context";
import { useState } from "react";

/**
 * Hook for rubric builder state management.
 */
export const useRubricBuilder = () => {
  // access Rubric, Assignment, Course context
  const { activeRubric, setActiveRubric, getRubric } = useRubric();
  const { activeCourse } = useCourse();
  const { activeAssignment } = useAssignment();

  // access global modal to display info to user
  const { openDialog, closeDialog } = useChoiceDialog();

  // tracks which criterion card is displaying the detailed view (limited to one at a time)
  const [activeCriterionIndex, setActiveCriterionIndex] = useState(-1);

  // flag if the API is bypassed and should load the rubric builder in offline mode
  const [isCanvasBypassed, setIsCanvasBypassed] = useState(false);
};
