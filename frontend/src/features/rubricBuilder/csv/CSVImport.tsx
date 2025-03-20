import React, { useRef, useState } from "react";
import { importCsv } from "@utils";
import { Dialog, PaletteActionButton } from "@components";
import { Criteria, Rubric } from "palette-types";
import { useRubric } from "@context";
import { useSettings } from "../../../context/SettingsContext.tsx";

export const CSVImport = () => {
  const { activeRubric, setActiveRubric } = useRubric();
  const { settings } = useSettings();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const closeErrorDialog = () => setErrorMessage(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (fileExtension !== "csv") {
      alert("Unsupported file format. Please upload a CSV file.");
      return;
    }

    importCsv(file, settings, handleImportSuccess, handleImportError);
  };

  /**
   * Generates a set of the current criteria descriptions stored within the component state
   * to use for checking duplicate entries.
   */
  const buildCriteriaDescriptionSet = (rubric: Rubric): Set<string> =>
    new Set(
      (rubric?.criteria || []).map((criterion) =>
        criterion.description.trim().toLowerCase(),
      ),
    );

  const handleImportError = (error: string) => {
    setErrorMessage(error);
  };

  const handleImportSuccess = (newCriteria: Criteria[]) => {
    const existingDescriptions = buildCriteriaDescriptionSet(activeRubric);

    const hasDuplicates = newCriteria.some((criterion) =>
      existingDescriptions.has(criterion.description.trim().toLowerCase()),
    );
    const uniqueCriteria = newCriteria.filter(
      (criterion) =>
        !existingDescriptions.has(criterion.description.trim().toLowerCase()),
    );

    if (hasDuplicates) {
      setErrorMessage(
        "Some criteria were not imported because they already exist in the rubric.",
      );
    }

    const buildNewRubric = () => {
      return activeRubric
        ? ({
            ...activeRubric,
            criteria: [...activeRubric.criteria, ...uniqueCriteria],
            pointsPossible:
              activeRubric.pointsPossible +
              uniqueCriteria.reduce(
                (sum, criterion) => sum + criterion.pointsPossible,
                0,
              ),
          } as Rubric)
        : ({
            title: "Imported Rubric",
            criteria: uniqueCriteria,
            pointsPossible: uniqueCriteria.reduce(
              (sum, criterion) => sum + criterion.pointsPossible,
              0,
            ),
            key: "placeholder-key", // Placeholder
            id: "placeholder-id",
          } as Rubric);
    };

    setActiveRubric(buildNewRubric());
  };

  return (
    <div className="flex flex-col items-center">
      {/*hidden file input element is stored in a useRef hook. When the user clicks the import csv button,
         programmatically trigger the file input dialog.*/}
      <PaletteActionButton
        onClick={() => fileInputRef.current?.click()}
        title={"Import CSV"}
        color={"BLUE"}
      />

      <Dialog isOpen={!!errorMessage} onClose={closeErrorDialog} title="Error">
        <p>{errorMessage}</p>
        <button
          onClick={closeErrorDialog}
          className="bg-red-600 text-white font-bold rounded-lg py-2 px-4 mt-4 transition duration-300 hover:bg-red-700 focus:outline-none"
        >
          OK
        </button>
      </Dialog>

      <Dialog
        isOpen={!!errorMessage}
        onClose={closeErrorDialog}
        title="Import Notice"
      >
        <p className="whitespace-pre-wrap">{errorMessage}</p>{" "}
        {/* Preserve formatting */}
        <button
          onClick={closeErrorDialog}
          className="bg-red-600 text-white font-bold rounded-lg py-2 px-4 mt-4 transition duration-300 hover:bg-red-700 focus:outline-none"
        >
          OK
        </button>
      </Dialog>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        id="file-input"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
