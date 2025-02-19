import { ReactElement, useEffect, useState } from "react";
import { GroupedSubmissions, PaletteAPIResponse, Rubric } from "palette-types";
import { useFetch } from "@hooks";
import { useAssignment, useCourse, useRubric } from "@context";
import {
  LoadingDots,
  MainPageTemplate,
  NoAssignmentSelected,
  NoCourseSelected,
} from "@components";

import { SubmissionsDashboard } from "@features";

export function GradingMain(): ReactElement {
  // state
  const [submissions, setSubmissions] = useState<GroupedSubmissions>({
    "No Group": [],
  });

  const [loading, setLoading] = useState<boolean>(false);

  // context providers
  const { activeCourse } = useCourse();
  const { activeAssignment } = useAssignment();
  const { setActiveRubric } = useRubric();

  // url string constants
  const fetchSubmissionsURL = `/courses/${activeCourse?.id}/assignments/${activeAssignment?.id}/submissions`;
  const getRubricURL = `/courses/${activeCourse?.id}/rubrics/${activeAssignment?.rubricId}`;

  // define fetch hooks
  const { fetchData: getRubric } = useFetch(getRubricURL);
  const { fetchData: getSubmissions } = useFetch(fetchSubmissionsURL);

  /**
   * Clear state prior to fetch operations.
   */
  const resetState = () => {
    setActiveRubric(null);
    setSubmissions({ "No Group": [] });
  };

  // fetch rubric and submissions when course or assignment change
  useEffect(() => {
    if (!activeCourse || !activeAssignment) {
      // prevent effect if either course or assignment is not selected
      return;
    }

    resetState();
    setLoading(true);
    void fetchRubric();
    void fetchSubmissions();
  }, [activeCourse, activeAssignment]);

  const fetchRubric = async () => {
    if (!activeAssignment?.rubricId) return; // avoid fetch if assignment doesn't have an associated rubric
    try {
      const response = (await getRubric()) as PaletteAPIResponse<Rubric>;

      if (response.success) {
        setActiveRubric(response.data ?? null);
      }
    } catch (error) {
      console.error("An error occurred while getting rubric: ", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response =
        (await getSubmissions()) as PaletteAPIResponse<GroupedSubmissions>;

      if (response.success && response.data) {
        setSubmissions(response.data);
      }
    } catch (error) {
      console.error("An error occurred while getting submissions: ", error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (!loading && activeCourse && activeAssignment) {
      return (
        <SubmissionsDashboard
          submissions={submissions}
          fetchSubmissions={fetchSubmissions}
          setLoading={setLoading}
        />
      );
    }

    return (
      <>
        <div className={"grid h-full"}>
          {loading && <LoadingDots />}
          {!activeCourse && <NoCourseSelected />}
          {activeCourse && !activeAssignment && <NoAssignmentSelected />}
        </div>
      </>
    );
  };

  return <MainPageTemplate children={renderContent()} />;
}
