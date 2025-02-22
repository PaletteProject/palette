import Papa from "papaparse";

export type ParsedStudent = {
  name: string;
  canvasUserId: string;
  userId: string;
  loginId: string;
  section: string;
  groupName: string;
  canvasGroupId: string;
};

export function parseCSV(file: File): Promise<ParsedStudent[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<{ [key: string]: string }>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log("Raw Parsed CSV Data:", results.data);

        if (results.errors.length) {
          console.error("CSV Parsing Errors:", results.errors);
          reject(new Error("CSV parsing failed"));
        } else {
          resolve(
            results.data.map((row) => ({
              name: row["Student Name"] || "Unknown",
              canvasUserId: row["ASURITE ID"] || "N/A",
              userId: row["User ID"] || "N/A",
              loginId: row["Login ID"] || "N/A",
              section: row["Section"] || "N/A",
              groupName: row["Group Name"] || "No Group",
              canvasGroupId: row["Group ID"] || "N/A",
            })),
          );
        }
      },
    });
  });
}
