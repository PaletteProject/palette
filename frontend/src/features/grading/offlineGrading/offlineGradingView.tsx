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

export function OfflineGradingView(): ReactElement {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [offlineSubmissions, setOfflineSubmissions] = useState<GroupedSubmissions>({});
  const [offlineRubric, setOfflineRubric] = useState<Rubric | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [gradedSubmissionCache, setGradedSubmissionCache] = useState<
    Record<number, PaletteGradedSubmission>
  >({});

  useEffect(() => {
    if (selectedCourse && selectedAssignment) {
      const submissionsKey = `offlineSubmissions_${selectedCourse}_${selectedAssignment}`;
      const rubricKey = `offlineRubric_${selectedCourse}_${selectedAssignment}`;
      const gradesKey = `offlineGradingCache_${selectedCourse}_${selectedAssignment}`;
  
      try {
        const submissionsRaw = localStorage.getItem(submissionsKey);
        const rubricRaw = localStorage.getItem(rubricKey);
        const gradedRaw = localStorage.getItem(gradesKey);
  
        setOfflineSubmissions(
          submissionsRaw ? (JSON.parse(submissionsRaw) as GroupedSubmissions) : {}
        );
        setOfflineRubric(
          rubricRaw ? (JSON.parse(rubricRaw) as Rubric) : null
        );
        setGradedSubmissionCache(
          gradedRaw ? (JSON.parse(gradedRaw) as Record<number, PaletteGradedSubmission>) : {}
        );
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

    alert("Offline grading data has been cleared!");
  };

  const handleSubmitGrades = async () => {
    const BASE_URL = "http://localhost:3000/api";

    if (!selectedCourse || !selectedAssignment) {
      alert("Missing course or assignment context.");
      return;
    }

    const grades = aggregateOfflineGrades(selectedCourse, selectedAssignment);

    if (Object.keys(grades).length === 0) {
      alert("No offline grades found to submit.");
      return;
    }

    try {
      for (const submission of Object.values(grades)) {
        await fetch(
          `${BASE_URL}/courses/${selectedCourse}/assignments/${selectedAssignment}/submissions/${submission.user.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
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
            savedGrades={gradedSubmissionCache}
            setSavedGrades={setGradedSubmissionCache}
            rubric={safeOfflineRubric}
          />
        </GradingProvider>
      )}

      {selectedCourse && selectedAssignment && Object.keys(offlineSubmissions).length > 0 && (
        <div className="mt-4  hover:bg-200">
          <h2 className="text-xl font-semibold text-white">Select a Group</h2>
          {Object.entries(offlineSubmissions).map(([groupName, submissions]) => (
            <button
              key={groupName}
              className="block bg-gray-700 hover:bg-gray-800 text-white p-3 rounded mt-2 w-full text-left"
              onClick={() => setSelectedGroup(groupName)}
            >
              {groupName} ({submissions.length} submissions)
            </button>
          ))}

        <button
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
          onClick={() => {
            void handleSubmitGrades();
          }}
        >
          Submit Offline Grades to Canvas
        </button>

         <button
        color="RED"
        className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 mt-4 rounded"
        onClick={handleClearOfflineStorage}
      >
        Clear Offline Storage
      </button>
        </div>
      )}
    </div>
  );
}
