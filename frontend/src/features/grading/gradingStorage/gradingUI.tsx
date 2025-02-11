import { useState } from "react";
import { parseCSV, ParsedStudent } from "../csv/gradingCSV.ts";
import { updateGrade, getStoredGrades } from "./gradingStorage.ts";

export function gradingUI() {
    const [students, setStudents] = useState<ParsedStudent[]>([]);
    const [grades, setGrades] = useState<{ [userId: string]: number }>({});
  
    // Handle file upload and parse the CSV
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        try {
          const parsedStudents = await parseCSV(file);
          setStudents(parsedStudents);
  
          // Load saved grades from local storage
          const storedGrades = getStoredGrades();
          const gradeMap = storedGrades.reduce((acc, entry) => {
            acc[entry.userId] = entry.grade;
            return acc;
          }, {} as { [userId: string]: number });
  
          setGrades(gradeMap);
        } catch (error) {
          console.error("Error parsing CSV:", error);
        }
      }
    };
  
    // Handle grade changes and save to local storage
    const handleGradeChange = (userId: string, groupId: string, grade: number) => {
      setGrades((prev) => ({ ...prev, [userId]: grade }));
      updateGrade(userId, groupId, grade);
    };
  
    return (
      <div>
        <h2>Upload CSV</h2>
        <input type="file" accept=".csv" onChange={handleFileUpload} />
  
        <h2>Grade Students</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Group</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.userId}>
                <td>{student.name}</td>
                <td>{student.groupName}</td>
                <td>
                  <input
                    type="number"
                    value={grades[student.userId] || ""}
                    onChange={(e) =>
                      handleGradeChange(student.userId, student.canvasGroupId, Number(e.target.value))
                    }
                    placeholder="Enter Grade"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }