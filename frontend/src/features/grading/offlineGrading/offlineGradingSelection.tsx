import { useState, useEffect } from "react";

export function OfflineGradingSelection({
  onSelect,
}: {
  onSelect: (courseId: string, assignmentId: string) => void;
}) {
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [availableAssignments, setAvailableAssignments] = useState<string[]>(
    [],
  );
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");

  const [courseNameMap, setCourseNameMap] = useState<Record<string, string>>({});
  const [assignmentNameMap, setAssignmentNameMap] = useState<Record<string, string>>({});

  // Load course list and name map
  useEffect(() => {
    const storedCoursesRaw = localStorage.getItem("offlineCourses");
    const storedCourses: string[] = storedCoursesRaw
      ? JSON.parse(storedCoursesRaw)
      : [];
    setAvailableCourses(storedCourses);

    const storedCourseNames = localStorage.getItem("courseNameMap");
    setCourseNameMap(storedCourseNames ? JSON.parse(storedCourseNames) : {});
  }, []);

  // Load assignments and assignment name map when course changes
  useEffect(() => {
    if (selectedCourse) {
      const storedAssignmentsRaw = localStorage.getItem(
        `offlineAssignments_${selectedCourse}`,
      );
      const storedAssignments: string[] = storedAssignmentsRaw
        ? JSON.parse(storedAssignmentsRaw)
        : [];
      setAvailableAssignments(storedAssignments);

      const storedAssignmentNames = localStorage.getItem(
        `assignmentNameMap_${selectedCourse}`,
      );
      setAssignmentNameMap(
        storedAssignmentNames ? JSON.parse(storedAssignmentNames) : {},
      );
    }
  }, [selectedCourse]);

  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-white">
        Select Course & Assignment
      </h2>

      {/* Course Selection */}
      <select
        className="mt-2 p-2 w-full rounded bg-gray-700 text-white"
        value={selectedCourse}
        onChange={(e) => {
          setSelectedCourse(e.target.value);
          setSelectedAssignment("");
        }}
      >
        <option value="" disabled>
          Select a Course
        </option>
        {availableCourses.map((courseId) => (
          <option key={courseId} value={courseId}>
            {courseNameMap[courseId] || `Course ${courseId}`}
          </option>
        ))}
      </select>

      {/* Assignment Selection */}
      {selectedCourse && (
        <select
          className="mt-2 p-2 w-full rounded bg-gray-700 text-white"
          value={selectedAssignment}
          onChange={(e) => {
            setSelectedAssignment(e.target.value);
            onSelect(selectedCourse, e.target.value);
          }}
        >
          <option value="" disabled>
            Select an Assignment
          </option>
          {availableAssignments.map((assignmentId) => (
            <option key={assignmentId} value={assignmentId}>
              {assignmentNameMap[assignmentId] || `Assignment ${assignmentId}`}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
