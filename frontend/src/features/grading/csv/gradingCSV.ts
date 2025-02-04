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
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          reject(results.errors);
        } else {
          resolve(
            results.data.map((row: any) => ({
              name: row.name as string,
              canvasUserId: row["canvas_user_id"] as string, 
              userId: row["user_id"] as string,
              loginId: row["login_id"] as string,
              section: row["sections"] as string,
              groupName: row["group_name"] as string,
              canvasGroupId: row["canvas_group_id"] as string,
            })),
          );
        }
      },
    });
  });
}
