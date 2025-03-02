import { ReactElement, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GroupedSubmissions, Rubric, Submission, CanvasGradedSubmission } from "palette-types";
import { SubmissionsDashboard } from "@features";
import { ProjectGradingView } from "../ProjectGradingView";
import { OfflineGradingSelection } from "./offlineGradingSelection";

export function OfflineGradingView(): ReactElement {
  const navigate = useNavigate();
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
        const submissions = JSON.parse(localStorage.getItem(submissionsKey) || "{}");
        const rubric = JSON.parse(localStorage.getItem(rubricKey) || "null");

        if (Object.keys(submissions).length === 0) {
          console.warn("No offline submissions found.");
        }

        if (!rubric) {
          console.warn("No offline rubric found.");
        }

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
        <p className="text-white mt-4">No submissions available for offline grading.</p>
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
        className="bg-gray-600 text-white py-2 px-4 mt-4 rounded"
        onClick={() => navigate("/grading")}
      >
        Back to Grading
      </button>
    </div>
  );
}
