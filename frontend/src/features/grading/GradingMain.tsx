import { ReactElement, useEffect, useState } from "react";
import { GroupedSubmissions, PaletteAPIResponse } from "palette-types";
import { useFetch } from "@hooks";
import { useAssignment, useCourse, useRubric } from "@context";
import { parseCSV, ParsedStudent } from "./csv/gradingCSV.ts";
import { exportAllGroupsCSV } from "./csv/exportAllGroups.ts"; // Import the export function
import { OfflineGradingView } from "./offlineGrading/offlineGradingView";
import { transferToOfflineGrading } from "./offlineGrading/transferToOfflineGrading.ts"; // ✅ Import the transfer function



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
  const { activeRubric } = useRubric();
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // url string constants
  const fetchSubmissionsURL = `/courses/${activeCourse?.id}/assignments/${activeAssignment?.id}/submissions`;

  const { fetchData: getSubmissions } = useFetch(fetchSubmissionsURL);

  /**
   * Load students from local storage on component mount
   */
  useEffect(() => {
    if (activeCourse && activeAssignment) {
      const storageKey = `parsedStudents_${activeCourse.id}_${activeAssignment.id}`;
      const storedStudentsString = localStorage.getItem(storageKey);

      if (storedStudentsString) {
        try {
          const storedStudentsRaw = localStorage.getItem(storageKey);
          const storedStudents: ParsedStudent[] = storedStudentsRaw
            ? (JSON.parse(storedStudentsRaw) as ParsedStudent[]) // ✅ Type assertion
            : [];
          console.log(
            `Retrieved students for ${activeAssignment.id}:`,
            storedStudents,
          );
        } catch (error) {
          console.error(
            "Error parsing stored students from localStorage:",
            error,
          );
        }
      }
    }
  }, [activeCourse, activeAssignment]);

  /**
   * Handle CSV Upload for group data
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file && activeCourse && activeAssignment) {
      console.log("📂 Uploading file:", file.name);

      parseCSV(file)
        .then((parsedStudents) => {
          console.log("Parsed Students:", parsedStudents);

          if (parsedStudents.length > 0) {
            const storageKey = `parsedStudents_${activeCourse.id}_${activeAssignment.id}`;
            localStorage.setItem(storageKey, JSON.stringify(parsedStudents));

            console.log(
              "Saved parsedStudents to localStorage under key:",
              storageKey,
            );
          } else {
            console.warn("Parsed students list is empty, not saving.");
          }
        })
        .catch((error) => {
          console.error(" Error parsing CSV:", error);
          alert("Failed to import CSV.");
        });
    }
  };

  /**
   * Export all group submissions to a CSV
   */
  const handleExportAllGroups = () => {
    if (activeRubric) {
      exportAllGroupsCSV(submissions, activeRubric);
    } else {
      alert("Cannot export: Missing rubric.");
    }
  };

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
  <button
    className={`py-2 px-4 rounded font-bold ${
      isOfflineMode ? "bg-gray-500" : "bg-blue-500"
    } text-white`}
    onClick={() => setIsOfflineMode(!isOfflineMode)}
  >
    {isOfflineMode ? "Switch to Canvas Grading" : "Switch to Offline Grading"}
  </button>

  {!isOfflineMode && activeAssignment && Object.keys(submissions).length > 0 && (
    <button
      className="bg-yellow-500 text-white font-bold py-2 px-4 rounded"
      onClick={() =>
        transferToOfflineGrading(
          String(activeCourse?.id || ""),
          String(activeAssignment?.id || ""),
          String(activeRubric?.id || "")
        )
      }
    >
      Transfer to Offline Grading
    </button>
  )}
</div>


        {/* ✅ Render OfflineGradingView if Offline Mode is Active */}
        {isOfflineMode ? (
          <OfflineGradingView />
        ) : (
          <>
            {/* ✅ Standard Grading View (Canvas-Based) */}
            {activeCourse && activeAssignment ? (
              <SubmissionsDashboard submissions={submissions} fetchSubmissions={fetchSubmissions} setLoading={setLoading} />
            ) : (
              <div className="grid h-full">
                {loading && <LoadingDots />}
                {!activeCourse && <NoCourseSelected />}
                {activeCourse && !activeAssignment && <NoAssignmentSelected />}
              </div>
            )}
          </>
        )}
      </>
    );
  };

  return <MainPageTemplate>{renderContent()}</MainPageTemplate>;
}