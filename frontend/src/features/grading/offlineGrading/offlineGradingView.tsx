import { ReactElement, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GroupedSubmissions, Rubric } from "palette-types";
import { SubmissionsDashboard } from "@features";

export function OfflineGradingView(): ReactElement {
  const navigate = useNavigate();

  // State to store offline grading data
  const [offlineSubmissions, setOfflineSubmissions] = useState<GroupedSubmissions>({});
  const [offlineStudents, setOfflineStudents] = useState<any[]>([]);
  const [offlineGrades, setOfflineGrades] = useState<any[]>([]);
  const [offlineRubric, setOfflineRubric] = useState<Rubric | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Get active course and assignment IDs from local storage
    const storedCourseId = localStorage.getItem("lastActiveCourse");
    const storedAssignmentId = localStorage.getItem("lastActiveAssignment");

    if (!storedCourseId || !storedAssignmentId) {
      console.warn("⚠ No course or assignment selected for Offline Grading.");
      return;
    }

    // Define offline storage keys
    const offlineSubmissionsKey = `offlineSubmissions_${storedCourseId}_${storedAssignmentId}`;
    const offlineStudentsKey = `offlineParsedStudents_${storedCourseId}_${storedAssignmentId}`;
    const offlineGradesKey = `offlineGrades_${storedCourseId}_${storedAssignmentId}_rubric_default`;
    const offlineRubricKey = `offlineRubric_default`; // Rubric key

    // Retrieve offline submissions
    const savedSubmissions = localStorage.getItem(offlineSubmissionsKey);
    if (savedSubmissions) {
      setOfflineSubmissions(JSON.parse(savedSubmissions));
      console.log("✅ Loaded Offline Submissions:", JSON.parse(savedSubmissions));
    }

    // Retrieve offline students
    const savedStudents = localStorage.getItem(offlineStudentsKey);
    if (savedStudents) {
      setOfflineStudents(JSON.parse(savedStudents));
      console.log("✅ Loaded Offline Students:", JSON.parse(savedStudents));
    }

    // Retrieve offline grades
    const savedGrades = localStorage.getItem(offlineGradesKey);
    if (savedGrades) {
      setOfflineGrades(JSON.parse(savedGrades));
      console.log("✅ Loaded Offline Grades:", JSON.parse(savedGrades));
    }

    // Retrieve offline rubric
    const savedRubric = localStorage.getItem(offlineRubricKey);
    if (savedRubric) {
      setOfflineRubric(JSON.parse(savedRubric));
      console.log("✅ Loaded Offline Rubric:", JSON.parse(savedRubric));
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white">Offline Grading</h1>
      <p className="text-gray-300">This section allows grading without a Canvas token.</p>

      {/* Show grading interface if rubric is available */}
      {offlineRubric && (
        <SubmissionsDashboard
        submissions={offlineSubmissions}
        fetchSubmissions={async () => Promise.resolve()} 
        setLoading={setLoading} // ✅ Use actual state updater
      />


      )}

      {/* Back Button */}
      <button
        className="bg-gray-600 text-white py-2 px-4 mt-4 rounded"
        onClick={() => navigate("/grading")}
      >
        Back to Grading
      </button>
    </div>
  );
}
