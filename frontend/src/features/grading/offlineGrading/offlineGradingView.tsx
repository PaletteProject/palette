import { ReactElement, useEffect, useState } from "react";
import {
  GroupedSubmissions,
  Rubric,
  CanvasGradedSubmission,
} from "palette-types";
import { ProjectGradingView } from "../projectGradingComponents/ProjectGradingView";
import { OfflineGradingSelection } from "./offlineGradingSelection";
import { transferOfflineToTokenGrading } from "./transferOfflineToTokenGrading";
import { GradingProvider } from "../../../context/GradingContext.tsx";

export function OfflineGradingView(): ReactElement {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(
    null,
  );
  const [offlineSubmissions, setOfflineSubmissions] =
    useState<GroupedSubmissions>({});
  const [offlineRubric, setOfflineRubric] = useState<Rubric | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [gradedSubmissionCache, setGradedSubmissionCache] = useState<
    Record<number, CanvasGradedSubmission>
  >({});
  const [lastTransferVersion, setLastTransferVersion] = useState<string | null>(null);
  
  useEffect(() => {
    if (selectedCourse && selectedAssignment) {
      const submissionsKey = `offlineSubmissions_${selectedCourse}_${selectedAssignment}`;
      const rubricKey = `offlineRubric_${selectedCourse}_${selectedAssignment}`;
      const gradesKey = `offlineGradingCache_${selectedCourse}_${selectedAssignment}`;
      const versionKey = `offlineTransferVersion_${selectedCourse}_${selectedAssignment}`;
      const version = localStorage.getItem(versionKey);
  
      try {
        const submissionsRaw = localStorage.getItem(submissionsKey);
        const rubricRaw = localStorage.getItem(rubricKey);
        const gradedRaw = localStorage.getItem(gradesKey);
  
        setOfflineSubmissions(submissionsRaw ? JSON.parse(submissionsRaw) : {});
        setOfflineRubric(rubricRaw ? JSON.parse(rubricRaw) : null);
        setGradedSubmissionCache(gradedRaw ? JSON.parse(gradedRaw) : {});
        setLastTransferVersion(version ?? null);
      } catch (error) {
        console.error("Error loading offline grading data:", error);
      }
    }
  }, [selectedCourse, selectedAssignment, lastTransferVersion]);
  

  // ✅ Save cache to localStorage when it changes
  useEffect(() => {
    if (selectedCourse && selectedAssignment) {
      const gradesKey = `offlineGradingCache_${selectedCourse}_${selectedAssignment}`;
      localStorage.setItem(gradesKey, JSON.stringify(gradedSubmissionCache));
    }
  }, [gradedSubmissionCache, selectedCourse, selectedAssignment]);

  const safeOfflineRubric: Rubric = offlineRubric ?? {
    id: "default",
    title: "Default Rubric",
    pointsPossible: 100,
    key: "default-rubric-key",
    criteria: [],
  };

  const handleClearOfflineStorage = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("offline")) {
        localStorage.removeItem(key);
      }
    });

    setOfflineSubmissions({});
    setOfflineRubric(null);
    setGradedSubmissionCache({});
    setSelectedCourse(null);
    setSelectedAssignment(null);

    alert("✅ Offline grading data has been cleared!");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white">Offline Grading</h1>

      <OfflineGradingSelection
        onSelect={(course, assignment) => {
          setSelectedCourse(course);
          setSelectedAssignment(assignment);
        }}
      />

      {Object.keys(offlineSubmissions).length > 0 ? (
        <div className="mt-4">
          <h2 className="text-xl font-semibold text-white">Select a Group</h2>
          {Object.entries(offlineSubmissions).map(
            ([groupName, submissions]) => (
              <button
                key={groupName}
                className="block bg-gray-700 text-white p-3 rounded mt-2 w-full text-left"
                onClick={() => setSelectedGroup(groupName)}
              >
                {groupName} ({submissions.length} submissions)
              </button>
            ),
          )}
        </div>
      ) : (
        <p className="text-white mt-4">
          No submissions available for offline grading.
        </p>
      )}

      {selectedGroup && (
        <GradingProvider>
          <ProjectGradingView
            groupName={selectedGroup}
            submissions={offlineSubmissions[selectedGroup] || []}
            isOpen={Boolean(selectedGroup)}
            onClose={() => setSelectedGroup(null)}
            savedGrades={gradedSubmissionCache}
            setSavedGrades={setGradedSubmissionCache}
            rubric={safeOfflineRubric}
          />
        </GradingProvider>
      )}

      {/* Transfer Offline Grading to Token-Based Grading */}
      <button
        className="bg-blue-500 text-white py-2 px-4 mt-4 rounded"
        onClick={() =>
          transferOfflineToTokenGrading(
            setGradedSubmissionCache,
            selectedCourse,
            selectedAssignment,
          )
        }
      >
        Transfer to Token-Based Grading
      </button>

      <button
        className="bg-red-600 text-white py-2 px-4 mt-4 rounded"
        onClick={handleClearOfflineStorage}
      >
        Clear Offline Storage
      </button>
    </div>
  );
}
