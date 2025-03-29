import { useAssignment, useCourse, useRubric } from "@context";
import { useState } from "react";
import { useFetch } from "./useFetch.ts";

/**
 * Hook for rubric builder state management.
 */
export const useRubricBuilder = () => {
  // access Rubric, Assignment, Course context
  const { activeRubric, setActiveRubric, getRubric } = useRubric();
  const { activeCourse } = useCourse();
  const { activeAssignment } = useAssignment();

  // tracks which criterion card is displaying the detailed view (limited to one at a time)
  const [activeCriterionIndex, setActiveCriterionIndex] = useState(-1);

  // flag if the API is bypassed and should load the rubric builder in offline mode
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // result of hook checking if active assignment has an existing rubric
  const [hasExistingRubric, setHasExistingRubric] = useState(false);

  // flag for if loading component should be rendered
  const [loading, setLoading] = useState(false);

  // flag to determine if new rubric should be sent via POST or updated via PUT
  const [isNewRubric, setIsNewRubric] = useState(false);

  const { fetchData: putRubric } = useFetch(
    `/courses/${activeCourse?.id}/rubrics/${activeAssignment?.rubricId}/${activeAssignment?.id}`,
    {
      method: "PUT",
      body: JSON.stringify(activeRubric),
    },
  );

  const { fetchData: postRubric } = useFetch(
    `/courses/${activeCourse?.id}/rubrics/${activeAssignment?.id}`,
    {
      method: "POST",
      body: JSON.stringify(activeRubric),
    },
  );

  return {
    activeRubric,
    setActiveRubric,
    activeCourse,
    activeAssignment,
    getRubric,
    postRubric,
    putRubric,
    activeCriterionIndex,
    setActiveCriterionIndex,
    isOfflineMode,
    setIsOfflineMode,
    hasExistingRubric,
    setHasExistingRubric,
    loading,
    setLoading,
    isNewRubric,
    setIsNewRubric,
  };
};
