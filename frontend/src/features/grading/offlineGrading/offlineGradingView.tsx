import { ReactElement, useEffect, useState } from "react";
import {
  GroupedSubmissions,
  Rubric,
  PaletteGradedSubmission,
} from "palette-types";
import { ProjectGradingView } from "../projectGradingComponents/ProjectGradingView";
import { OfflineGradingSelection } from "./offlineGradingSelection";
import { GradingProvider } from "../../../context/GradingContext.tsx";
import { aggregateOfflineGrades } from "./aggregateOfflineGrades";
import { useCourse, useAssignment } from "@/context";

export function OfflineGradingView(): ReactElement {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [offlineSubmissions, setOfflineSubmissions] = useState<GroupedSubmissions>({});
  const [offlineRubric, setOfflineRubric] = useState<Rubric | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [gradedSubmissionCache, setGradedSubmissionCache] = useState<
    Record<number, PaletteGradedSubmission>
  >({});

  const { activeCourse } = useCourse();
  const { activeAssignment } = useAssignment();

  useEffect(() => {
    if (selectedCourse && selectedAssignment) {
      const submissionsKey = `offlineSubmissions_${selectedCourse}_${selectedAssignment}`;
      const rubricKey = `offlineRubric_${selectedCourse}_${selectedAssignment}`;
      const gradesKey = `offlineGradingCache_${selectedCourse}_${selectedAssignment}`;

      try {
        const submissionsRaw = localStorage.getItem(submissionsKey);
        const rubricRaw = localStorage.getItem(rubricKey);
        const gradedRaw = localStorage.getItem(gradesKey);

        setOfflineSubmissions(submissionsRaw ? JSON.parse(submissionsRaw) : {});
        setOfflineRubric(rubricRaw ? JSON.parse(rubricRaw) : null);
        setGradedSubmissionCache(gradedRaw ? JSON.parse(gradedRaw) : {});
      } catch (error) {
        console.error("Error loading offline grading data:", error);
      }
    }
  }, [selectedCourse, selectedAssignment]);

  useEffect(() => {
    if (selectedCourse && selectedAssignment) {
      const gradesKey = `offlineGradingCache_${selectedCourse}_${selectedAssignment}`;
      localStorage.setItem(gradesKey, JSON.stringify(gradedSubmissionCache));
    }
  }, [gradedSubmissionCache, selectedCourse, selectedAssignment]);

  const safeOfflineRubric: Rubric = offlineRubric ?? {
    id: -1,
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

    alert("Offline grading data has been cleared!");
  };

  const handleSubmitGrades = async () => {
    const token = localStorage.getItem("accessToken") || "";
    const BASE_URL = "http://localhost:3000/api";

    if (!selectedCourse || !selectedAssignment) {
      alert("Missing course, or assignment context.");
      return;
    }

    const grades = aggregateOfflineGrades(selectedCourse, selectedAssignment);
    const confirmed = window.confirm(
      "Are you sure you want to submit all offline grades to Canvas?"
    );
  
    if (!confirmed) return;
  
    try {
      for (const submission of Object.values(grades)) {
        await fetch(
          `${BASE_URL}/courses/${selectedCourse}/assignments/${selectedAssignment}/submissions/${submission.user.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(submission),
          }
        );
      }

      alert("Offline grades successfully submitted to Canvas!");
    } catch (err) {
      console.error("Error submitting grades:", err);
      alert("Failed to submit grades. See console.");
    }
  };

  const renderGroupCards = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(offlineSubmissions).map(([groupName, groupSubmissions]) => {
          const gradedCount = groupSubmissions.reduce(
            (count, submission) => (submission.graded ? count + 1 : count),
            0,
          );
          const progress = Math.floor((gradedCount / groupSubmissions.length) * 100);

          const averageScore = (() => {
            const scores = groupSubmissions.map((s) => {
              const cached = gradedSubmissionCache[s.id];
              if (cached && cached.rubric_assessment) {
                return Object.values(cached.rubric_assessment)
                  .map(entry => Number(entry.points) || 0)
                  .reduce((a, b) => a + b, 0);
              }
              return s.score ?? 0;
            });
          
            return scores.length > 0
              ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
              : "N/A";
          })();
          

          return (
            <div key={groupName} className="rounded-xl border border-blue-400 p-4 w-full max-w-xs shadow-lg bg-gray-800 text-white relative">
              <span className="italic text-yellow-200 text-sm">In Progress</span>
              <h2 className="text-lg font-semibold mt-1">{groupName}</h2>

              <div className="w-full bg-gray-600 h-2 rounded my-2">
                <div className="bg-green-500 h-full rounded" style={{ width: `${progress}%` }}></div>
              </div>

              <p className="text-sm">Average Score: {averageScore}</p>

              <button
                onClick={() => setSelectedGroup(groupName)}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-lg font-semibold"
              >
                Grade
              </button>
            </div>
          );
        })}
      </div>
    );
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

      {selectedGroup && (
        <GradingProvider>
          <ProjectGradingView
            groupName={selectedGroup}
            submissions={offlineSubmissions[selectedGroup] || []}
            isOpen={Boolean(selectedGroup)}
            onClose={() => setSelectedGroup(null)}
            rubric={safeOfflineRubric}
            initMode="restore"
          />
        </GradingProvider>
      )}

      {selectedCourse && selectedAssignment && Object.keys(offlineSubmissions).length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">Select a Group</h2>
          {renderGroupCards()}

          <div className="flex gap-4 mt-6">
            <button
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              onClick={() => void handleSubmitGrades()}
            >
              Submit Offline Grades to Canvas
            </button>

            <button
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
              onClick={handleClearOfflineStorage}
            >
              Clear Offline Storage
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
