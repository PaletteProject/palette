import { useEffect, useState } from "react";
import { useAssignment, useCourse } from "@/context";
import { parseCSV, ParsedStudent } from "../csv/gradingCSV.ts";

export default function GradingUI() {
  const [students, setStudents] = useState<ParsedStudent[]>([]);
  const { activeAssignment } = useAssignment();
  const { activeCourse } = useCourse();

  useEffect(() => {
    if (!activeCourse || !activeAssignment) return;

    // Generate a unique storage key for each assignment
    const storageKey = `parsedStudents_${activeCourse.id}_${activeAssignment.id}`;

    const storedStudents = localStorage.getItem(storageKey);
    if (storedStudents) {
      const parsedStudents: ParsedStudent[] = JSON.parse(
        storedStudents,
      ) as ParsedStudent[];
      console.log(
        `Retrieved parsedStudents for ${storageKey}:`,
        parsedStudents,
      );
      setStudents(parsedStudents);
    }
  }, [activeCourse, activeAssignment]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !activeCourse || !activeAssignment) return;

    try {
      console.log(`Uploading file: ${file.name}`);
      const parsedStudents = await parseCSV(file);

      console.log("Parsed Students:", parsedStudents);

      if (parsedStudents.length > 0) {
        // Store parsed students per assignment
        const storageKey = `parsedStudents_${activeCourse.id}_${activeAssignment.id}`;
        localStorage.setItem(storageKey, JSON.stringify(parsedStudents));

        console.log(`Saved parsedStudents to ${storageKey}:`, parsedStudents);
        setStudents(parsedStudents);
      } else {
        console.warn("⚠️ Parsed students list is empty, not saving.");
      }
    } catch (error) {
      console.error("Error parsing CSV:", error);
    }
  };

  return (
    <div>
      <h2>Upload CSV</h2>
      <input
        type="file"
        accept=".csv"
        onChange={(event) => void handleFileUpload(event)}
      />

      <h2>Students</h2>
      <ul>
        {students.map((student) => (
          <li key={student.canvasUserId}>
            {student.name} - {student.groupName}
          </li>
        ))}
      </ul>
    </div>
  );
}
