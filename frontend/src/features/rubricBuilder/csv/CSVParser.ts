import Papa from "papaparse";
import { Criteria } from "palette-types";
import { createCriterion, createRating } from "@utils";

export const VERSION_ONE = 1;
export const VERSION_TWO = 2;

// Define a type for the callback function
type ParseCallback = (parsedData: Criteria[]) => void;
type ErrorCallback = (errorMessage: string) => void;

const parseRowData = (
  data: string[][],
  rowProcessor: (row: string[]) => Criteria | null,
  onSuccess: ParseCallback,
  onError: ErrorCallback,
) => {
  try {
    if (!data || data.length < 2) {
      throw new Error("The file is empty or missing required data.");
    }

    const newCriteria = data
      .slice(1) // Skip header row
      .map(rowProcessor)
      .filter(Boolean) as Criteria[]; // Explicitly assert the type

    if (!newCriteria.length) {
      throw new Error("No valid criteria found in the file.");
    }

    onSuccess(newCriteria);
  } catch (error) {
    onError(
      error instanceof Error
        ? error.message
        : "An unknown error occurred while parsing the file.",
    );
  }
};

// Parsing logic for Version 1
export const parseVersionOne = (
  data: string[][],
  onSuccess: ParseCallback,
  onError: ErrorCallback,
) => {
  parseRowData(
    data,
    (row) => {
      const criterionTitle = row[0]?.trim();
      const maxPoints = row[1] ? parseFloat(row[1]) : NaN;

      if (!criterionTitle || isNaN(maxPoints)) return null;

      const criterion: Criteria = createCriterion(
        criterionTitle,
        "",
        maxPoints,
        [],
      );
      let hasValidRating = false;
      for (let i = 1; i < row.length; i += 2) {
        const points = Number(row[i]) || 0;
        const description = row[i + 1]?.trim() || "";
        if (points !== 0 || description) {
          hasValidRating = true;
          criterion.ratings.push(createRating(points, description));
        }
      }
      // Skip if there are no valid ratings or descriptions
      if (!hasValidRating) return null;

      criterion.updatePoints();
      return criterion;
    },
    onSuccess,
    onError,
  );
};

// Parsing logic for Version 2
export const parseVersionTwo = (
  data: string[][],
  onSuccess: ParseCallback,
  onError: ErrorCallback,
) => {
  parseRowData(
    data,
    (row) => {
      const criterionTitle = row[0]?.trim();
      const longDescription = row[1]?.trim();
      const maxPoints = parseFloat(row[2]);

      if (!criterionTitle || isNaN(maxPoints)) return null;

      const criterion: Criteria = createCriterion(
        criterionTitle,
        longDescription || "",
        maxPoints,
        [],
      );

      for (let i = 3; i < row.length; i++) {
        const ratingText = row[i]?.trim();
        if (!ratingText) continue;

        const match = ratingText.match(/\(([^)]+)\)$/);
        const deduction = match ? parseFloat(match[1]) : 0;
        const points = maxPoints + deduction;
        const description = ratingText.replace(/\s*\([^)]*\)$/, "");

        if (!isNaN(points)) {
          criterion.ratings.push(createRating(points, description));
        }
      }

      return criterion;
    },
    onSuccess,
    onError,
  );
};

// Main utility to handle CSV parsing
export const importCsv = (
  file: File,
  version: number,
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

      if (version === VERSION_ONE) {
        parseVersionOne(parsedData, onSuccess, onError);
      } else if (version === VERSION_TWO) {
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
