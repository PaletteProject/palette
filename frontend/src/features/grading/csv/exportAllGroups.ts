import { saveAs } from "file-saver";
import { Rubric, Submission } from "palette-types";

export function exportAllGroupsCSV(
  groupedSubmissions: { [groupId: string]: Submission[] }, 
  rubric: Rubric
) {
  const headers = [
    "Student Name",
    "ASURITE ID",
    "Group Name",
    ...rubric.criteria.map(c => `"${c.description.replace(/"/g, '""')}"`),
    "Total Score"
  ];

  const rows: string[][] = [];

  Object.entries(groupedSubmissions).forEach(([groupId, submissions]) => { 
    submissions.forEach(submission => {
      const totalScore = rubric.criteria.reduce((sum, criterion) => {
        const score = submission.rubricAssessment?.[criterion.id]?.points || 0;
        return sum + score;
      }, 0);

      const groupName =
        submission.group?.name || // Correct group name extraction
        submission.groupName || // Another possible field
        "Unknown Group"; // Fallback if missing

      const row = [
        `"${submission.user.name.replace(/"/g, '""')}"`,
        submission.user.asurite,
        `"${groupName.replace(/"/g, '""')}"`, 
        ...rubric.criteria.map(criterion => submission.rubricAssessment?.[criterion.id]?.points || "0"),
        totalScore.toString(),
      ];

      rows.push(row);
    });
  });

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `all_groups_grading_export.csv`);
}