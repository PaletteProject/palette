import Papa from "papaparse";
import { Criteria } from "palette-types";
import { createCriterion, createRating } from "@utils";

// Define a type for the callback function
type ParseCallback = (parsedData: Criteria[]) => void;

// Parsing logic for Version 1
export const parseVersionOne = (data: string[][], callback: ParseCallback) => {
  const newCriteria = data
    .slice(1) // Skip header row
    .map((row) => {
      const criterionTitle = row[0]?.trim();
      if (!criterionTitle) return null;

      const criterion: Criteria = createCriterion(criterionTitle, "", 0, []);
      for (let i = 1; i < row.length; i += 2) {
        const points = Number(row[i]);
        const description = row[i + 1]?.toString();
        if (description) {
          criterion.ratings.push(createRating(points, description));
        }
      }
      criterion.updatePoints();
      return criterion;
    })
    .filter(Boolean) as Criteria[];

  callback(newCriteria);
};

// Parsing logic for Version 2
export const parseVersionTwo = (data: string[][], callback: ParseCallback) => {
  const newCriteria = data
    .slice(1) // Skip header row
    .map((row) => {
      const criterionTitle = row[0]?.trim() || "";
      const longDescription = row[1]?.trim() || "";
      const maxPoints = parseFloat(row[2]);

      if (!criterionTitle || isNaN(maxPoints)) return null;

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
    .filter(Boolean) as Criteria[];

  callback(newCriteria);
};

// Main utility to handle CSV parsing
export const importCsv = (
  file: File,
  version: "versionOne" | "versionTwo",
  callback: ParseCallback,
) => {
  Papa.parse(file, {
    header: false,
    complete: (results) => {
      const parsedData = results.data.filter((row): row is string[] => {
        return Array.isArray(row) && typeof row[0] === "string";
      });

      if (version === "versionOne") {
        parseVersionOne(parsedData, callback);
      } else if (version === "versionTwo") {
        parseVersionTwo(parsedData, callback);
      } else {
        console.error("Unsupported version for CSV parsing");
      }
    },
  });
};
