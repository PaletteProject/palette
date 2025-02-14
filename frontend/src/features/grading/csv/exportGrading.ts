import { saveAs } from "file-saver";  
import { Criteria, Rubric, Submission } from "palette-types";

export function exportToCSV(groupName: string, submissions: Submission[], rubric: Rubric) {
  const headers = [
    "Student Name",
    "ASURITE ID",
    "Group Name",
    ...rubric.criteria.map(c => `"${c.description.replace(/"/g, '""')}"`), 
    "Total Score"
  ];

  const rows = submissions.map(submission => {
    const totalScore = rubric.criteria.reduce((sum, criterion) => {
      const score = submission.rubricAssessment?.[criterion.id]?.points || 0;
      return sum + score;
    }, 0);

    return [
      `"${submission.user.name.replace(/"/g, '""')}"`, 
      submission.user.asurite,
      groupName,
      ...rubric.criteria.map(criterion => submission.rubricAssessment?.[criterion.id]?.points || "0"),
      totalScore
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `${groupName}_grading_export.csv`);
}
