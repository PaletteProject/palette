import { ReactElement, useEffect, useState } from "react";
import { GroupedSubmissions, PaletteAPIResponse } from "palette-types";
import { useFetch } from "@hooks";
import { useAssignment, useCourse } from "@context";
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

  // url string constants
  const fetchSubmissionsURL = `/courses/${activeCourse?.id}/assignments/${activeAssignment?.id}/submissions`;

  const { fetchData: getSubmissions } = useFetch(fetchSubmissionsURL);

  // fetch rubric and submissions when course or assignment change
  useEffect(() => {
    if (!activeCourse || !activeAssignment) {
      // prevent effect if either course or assignment is not selected
      return;
    }
    setLoading(true);
    void fetchSubmissions();
  }, [activeCourse, activeAssignment]);

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
