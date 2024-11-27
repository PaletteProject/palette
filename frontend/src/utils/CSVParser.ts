import Papa from "papaparse";
import { Criteria } from "palette-types";
import { createCriterion, createRating } from "@utils";

// Define a type for the callback function
type ParseCallback = (parsedData: Criteria[]) => void;
type ErrorCallback = (errorMessage: string) => void;

// Parsing logic for Version 1
export const parseVersionOne = (
  data: string[][],
  callback: ParseCallback,
  onError: ErrorCallback,
) => {
  try {
    if (!data || data.length < 2) {
      throw new Error("The file is empty or missing required data.");
    }

    const newCriteria = data
      .slice(1) // Skip header row
      .map((row) => {
        const criterionTitle = row[0]?.trim();
        const maxPoints = row[1] ? parseFloat(row[1]) : NaN; // Expecting MaxPoints in column 2
        if (isNaN(maxPoints)) {
          throw new Error(`Invalid File Format.`);
        }
        const criterion: Criteria = createCriterion(criterionTitle, "", 0, []);

        // Ratings are processed in pairs (points, description)
        for (let i = 1; i < row.length; i += 2) {
          const points = row[i] ? Number(row[i]) : 0; // Default to 0 if empty
          const description = row[i + 1]?.toString() || ""; // Default to empty string
          if (!isNaN(points)) {
            criterion.ratings.push(createRating(points, description));
          }
        }

        criterion.updatePoints();
        return criterion;
      })
      .filter(Boolean);

    if (!newCriteria.length) {
      throw new Error("No valid criteria were found in the file.");
    }

    callback(newCriteria);
  } catch (error) {
    onError(
      error instanceof Error
        ? error.message
        : "An unknown error occurred in Version 1 parsing.",
    );
  }
};

// Parsing logic for Version 2
export const parseVersionTwo = (
  data: string[][],
  callback: ParseCallback,
  onError: ErrorCallback,
) => {
  try {
    const newCriteria = data
      .slice(1) // Skip header row
      .map((row) => {
        const criterionTitle = row[0]?.trim() || "";
        const longDescription = row[1]?.trim() || "";
        const maxPoints = parseFloat(row[2]);

        if (!criterionTitle || isNaN(maxPoints)) {
          throw new Error("Invalid structure in Version 2.");
        }

        const criterion: Criteria = createCriterion(
          criterionTitle,
          longDescription,
          maxPoints,
          [],
        );

        for (let i = 3; i < row.length; i++) {
          const ratingText = row[i]?.toString().trim();
          if (!ratingText) continue;

          const match = ratingText.match(/\(([^)]+)\)$/);
          const deduction = match ? parseFloat(match[1]) : 0;
          const points = maxPoints + deduction;
          const description = ratingText.replace(/\s*\([^)]*\)$/, "");

          if (!isNaN(points) && description) {
            criterion.ratings.push(createRating(points, description));
          }
        }

        return criterion;
      })
      .filter(Boolean);

    callback(newCriteria);
  } catch (error) {
    onError(
      error instanceof Error
        ? error.message
        : "An unknown error occurred in Version 2 parsing.",
    );
  }
};

// Main utility to handle CSV parsing
export const importCsv = (
  file: File,
  version: "versionOne" | "versionTwo",
  onSuccess: ParseCallback,
  onError: ErrorCallback,
) => {
  Papa.parse(file, {
    header: false,
    complete: (results) => {
      const parsedData = results.data.filter((row): row is string[] =>
        Array.isArray(row),
      );

      if (!parsedData || !parsedData.length) {
        onError("The file is empty or not formatted correctly.");
        return;
      }

      if (version === "versionOne") {
        parseVersionOne(parsedData, onSuccess, onError);
      } else if (version === "versionTwo") {
        parseVersionTwo(parsedData, onSuccess, onError);
      } else {
        onError("Unsupported version for CSV parsing.");
      }
    },
    error: (error) => {
      onError(`Error parsing CSV: ${error.message}`);
    },
  });
};
