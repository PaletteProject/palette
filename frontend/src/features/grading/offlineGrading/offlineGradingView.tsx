import { ReactElement, useEffect, useState } from "react";
import {
  GroupedSubmissions,
  Rubric,
  CanvasGradedSubmission,
} from "palette-types";
import { ProjectGradingView } from "../ProjectGradingView";
import { OfflineGradingSelection } from "./offlineGradingSelection";
import { transferOfflineToTokenGrading } from "./transferOfflineToTokenGrading";

export function OfflineGradingView(): ReactElement {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [offlineSubmissions, setOfflineSubmissions] = useState<GroupedSubmissions>({});
  const [offlineRubric, setOfflineRubric] = useState<Rubric | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [gradedSubmissionCache, setGradedSubmissionCache] = useState<CanvasGradedSubmission[]>([]);

  useEffect(() => {
    if (selectedCourse && selectedAssignment) {
      const submissionsKey = `offlineSubmissions_${selectedCourse}_${selectedAssignment}`;
      const rubricKey = `offlineRubric_${selectedCourse}_${selectedAssignment}`;

      try {
        const submissionsRaw = localStorage.getItem(submissionsKey);
        const rubricRaw = localStorage.getItem(rubricKey);

        const submissions: GroupedSubmissions = submissionsRaw
          ? JSON.parse(submissionsRaw)
          : {};
        const rubric: Rubric | null = rubricRaw ? JSON.parse(rubricRaw) : null;

        setOfflineSubmissions(submissions);
        setOfflineRubric(rubric);
      } catch (error) {
        console.error("Error loading offline grading data:", error);
      }
    }
  }, [selectedCourse, selectedAssignment]);

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
        console.log(`🗑️ Deleted: ${key}`);
      }
    });

    setOfflineSubmissions({});
    setOfflineRubric(null);
    setGradedSubmissionCache([]);

    alert("✅ Offline grading data has been cleared!");
  };

  const handleTransfer = () => {
    if (gradedSubmissionCache.length === 0) {
      const saved = localStorage.getItem("offlineGradingCache");
      if (saved) {
        setGradedSubmissionCache(JSON.parse(saved));
      }
    }

    setTimeout(() => {
      transferOfflineToTokenGrading(
        setGradedSubmissionCache,
        selectedCourse,
        selectedAssignment,
      );
    }, 250); // short delay to ensure state is ready
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
          {Object.entries(offlineSubmissions).map(([groupName, submissions]) => (
            <button
              key={groupName}
              className="block bg-gray-700 text-white p-3 rounded mt-2 w-full text-left"
              onClick={() => setSelectedGroup(groupName)}
            >
              {groupName} ({submissions.length} submissions)
            </button>
          ))}
        </div>
      ) : (
        <p className="text-white mt-4">
          No submissions available for offline grading.
        </p>
      )}

      {selectedGroup && (
        <ProjectGradingView
          groupName={selectedGroup}
          submissions={offlineSubmissions[selectedGroup] || []}
          rubric={safeOfflineRubric}
          isOpen={Boolean(selectedGroup)}
          onClose={() => setSelectedGroup(null)}
          gradedSubmissionCache={gradedSubmissionCache}
          setGradedSubmissionCache={setGradedSubmissionCache}
        />
      )}

      <button
        className="bg-blue-500 text-white py-2 px-4 mt-4 rounded"
        onClick={handleTransfer}
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
