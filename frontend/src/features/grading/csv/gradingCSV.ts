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
    Papa.parse(file, {
      header: true, // Uses first row as column headers
      skipEmptyLines: true,
      complete: (results) => {
        console.log("Raw Parsed CSV Data:", results.data); 

        if (results.errors.length) {
          console.error("CSV Parsing Errors:", results.errors);
          reject(results.errors);
        } else {
          resolve(
            results.data.map((row: any) => ({
              name: row["Student Name"], 
              canvasUserId: row["ASURITE ID"], 
              userId: row["User ID"], 
              loginId: row["Login ID"], 
              section: row["Section"], 
              groupName: row["Group Name"] || "No Group", 
              canvasGroupId: row["Group ID"] || "N/A", 
            }))
          );
        }
      },
    });
  });
}
