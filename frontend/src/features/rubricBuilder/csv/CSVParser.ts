import Papa from "papaparse";
import { Criteria, Settings } from "palette-types";
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

// Parsing logic for Version 2
export const parseCsv = (
  data: string[][],
  settings: Settings,
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

      const criterion: Criteria = createCriterion(settings, {
        description: criterionTitle,
        longDescription: longDescription,
        points: maxPoints,
        ratings: [],
      });

      for (let i = 3; i < row.length; i++) {
        const ratingText = row[i]?.trim();
        if (!ratingText) continue;

        const match = ratingText.match(/\(([^)]+)\)$/);
        const deduction = match ? parseFloat(match[1]) : 0;
        const points = parseFloat((maxPoints + deduction).toFixed(2));
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
  settings: Settings,
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

      parseCsv(parsedData, settings, onSuccess, onError);
    },
    error: (error) => {
      onError(`Error parsing CSV: ${error.message}`);
    },
  });
};
