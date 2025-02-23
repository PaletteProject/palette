import Papa from "papaparse";
import { Rating } from "palette-types";
import { PaletteActionButton } from "@components";
import { useRubric } from "@context";

export const CSVExport = () => {
  const { activeRubric } = useRubric();

  const updatedExportToCSV = () => {
    if (!activeRubric) return;

    const maxRatings = Math.max(
      ...activeRubric.criteria.map((criterion) => criterion.ratings.length),
    );

    const header = ["Criteria", "Long description", "Max points"];
    for (let i = 0; i < maxRatings; i++) {
      header.push(`Rating ${i + 1}`);
    }
    // Prepare CSV data
    const data = activeRubric.criteria.map((criterion) => {
      // Initialize row with the criterion description, long description, and max points
      const row = [
        criterion.description,
        criterion.longDescription || "",
        criterion.pointsPossible?.toString() || "",
      ];

      // Add each rating and its associated points deduction
      criterion.ratings.forEach((rating: Rating) => {
        const reason = rating.longDescription
          ? `${rating.description} (${rating.points - criterion.pointsPossible})`
          : `${rating.description} (${rating.points - criterion.pointsPossible})`;
        row.push(reason);
      });

      // Fill remaining cells if there are fewer ratings than maxRatings
      while (row.length < header.length) {
        row.push(""); // Empty rating cells for missing ratings
      }

      return row;
    });

    // Combine header and data
    const csvData = [header, ...data];

    // Convert to CSV format using PapaParse
    const csv = Papa.unparse(csvData);

    // Trigger download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${activeRubric.title || "Rubric"}.csv`);
    link.click();
  };

  return (
    <PaletteActionButton
      onClick={updatedExportToCSV}
      title={"Export CSV"}
      color={"BLUE"}
    />
  );
};
