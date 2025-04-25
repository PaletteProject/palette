import { ReactElement, useEffect, useState } from "react";
import { GroupedSubmissions, PaletteAPIResponse } from "palette-types";
import { useFetch } from "@hooks";
import { useAssignment, useCourse, useRubric } from "@context";
import { OfflineGradingView } from "./offlineGrading/offlineGradingView";
import { transferToOfflineGrading } from "./offlineGrading/transferToOfflineGrading.ts";

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
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [transferring, setTransferring] = useState<boolean>(false);

  // context providers
  const { activeCourse } = useCourse();
  const { activeAssignment } = useAssignment();
  const { activeRubric } = useRubric();

  // url string constants
  const fetchSubmissionsURL = `/courses/${activeCourse?.id}/assignments/${activeAssignment?.id}/submissions`;

  const { fetchData: getSubmissions } = useFetch(fetchSubmissionsURL);

  /**
   * Load students from local storage on component mount
   */
  useEffect(() => {
    if (activeCourse && activeAssignment) {
      void fetchSubmissions();

      if (activeRubric) {
        const rubricKey = `rubric_${activeRubric.id}`;
        localStorage.setItem(rubricKey, JSON.stringify(activeRubric));
      }
    }
  }, [activeCourse, activeAssignment, activeRubric]);

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
    return (
      <>
        <div className="flex gap-4 items-center mb-4">
          {/* Toggle Button */}
          <button
            className={`py-2 px-4 rounded font-bold ${
              isOfflineMode
                ? "bg-gray-500 hover:bg-gray-600"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
            onClick={() => setIsOfflineMode(!isOfflineMode)}
          >
            {isOfflineMode
              ? "Switch to Canvas Grading"
              : "Switch to Offline Grading"}
          </button>

          {/* Transfer + Submit Buttons */}
          {!isOfflineMode &&
            activeCourse &&
            activeAssignment &&
            Object.keys(submissions).length > 0 && (
              <>
                <button
                  className="bg-yellow-500 text-white hover:bg-yellow-600 font-bold py-2 px-4 rounded"
                  onClick={() => {
                    if (!transferring) {
                      setTransferring(true);
                      transferToOfflineGrading(
                        activeCourse,
                        activeAssignment,
                        activeRubric,
                      );
                      setTimeout(() => setTransferring(false), 2000);
                    }
                  }}
                  disabled={transferring}
                >
                  {transferring
                    ? "Transferring..."
                    : "Transfer to Offline Grading"}
                </button>
              </>
            )}
        </div>

        {/* Conditional Rendering */}
        {isOfflineMode ? (
          <OfflineGradingView />
        ) : activeCourse && activeAssignment ? (
          <SubmissionsDashboard
            submissions={submissions}
            fetchSubmissions={fetchSubmissions}
            setLoading={setLoading}
          />
        ) : (
          <div className="grid h-full">
            {loading && <LoadingDots />}
            {!activeCourse && <NoCourseSelected />}
            {activeCourse && !activeAssignment && <NoAssignmentSelected />}
          </div>
        )}
      </>
    );
  };

  return <MainPageTemplate>{renderContent()}</MainPageTemplate>;
}
