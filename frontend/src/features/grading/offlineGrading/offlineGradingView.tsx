import { ReactElement, useEffect, useState, Dispatch, SetStateAction } from "react";
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
  const [gradingOpen, setGradingOpen] = useState(false);
  const [gradedSubmissionCache, setGradedSubmissionCache] = useState<CanvasGradedSubmission[]>([]);

  useEffect(() => {
    if (selectedCourse && selectedAssignment) {
      const submissionsKey = `offlineSubmissions_${selectedCourse}_${selectedAssignment}`;
      const rubricKey = `offlineRubric_${selectedCourse}_${selectedAssignment}`;

      setOfflineSubmissions(JSON.parse(localStorage.getItem(submissionsKey) || "{}"));
      setOfflineRubric(JSON.parse(localStorage.getItem(rubricKey) || "null"));
    }
  }, [selectedCourse, selectedAssignment]);

  const allOfflineSubmissions: Submission[] = Object.values(offlineSubmissions).flat();

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

      {offlineRubric && (
        <button
          className="bg-blue-500 text-white py-2 px-4 mt-4 rounded"
          onClick={() => setGradingOpen(true)}
        >
          Open Grading
        </button>
      )}

      {gradingOpen && (
        <ProjectGradingView
          groupName="Offline Group"
          submissions={allOfflineSubmissions}
          rubric={safeOfflineRubric}
          isOpen={gradingOpen}
          onClose={() => setGradingOpen(false)}
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
