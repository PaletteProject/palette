import React, { useState, useRef } from "react";
import { importCsv, VERSION_ONE, VERSION_TWO } from "@utils";
import { Dialog } from "@components";
import { Criteria, Rubric } from "palette-types";

interface CSVUploadProps {
  rubric: Rubric | undefined;
  setRubric: React.Dispatch<React.SetStateAction<Rubric | undefined>>;
}

export const CSVUpload: React.FC<CSVUploadProps> = ({ setRubric }) => {
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  const closeErrorDialog = () => setErrorMessage(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || selectedVersion === null) return;

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (fileExtension !== "csv") {
      alert("Unsupported file format. Please upload a CSV file.");
      return;
    }

    importCsv(file, selectedVersion, handleImportSuccess, handleImportError);
  };

  const triggerFile = (version: number) => {
    setSelectedVersion(version);
    fileInputRef.current?.click();
    setShowVersionModal(false);
  };

  /**
   * Generates a set of the current criteria descriptions stored within the component state
   * to use for checking duplicate entries.
   */
  const buildCriteriaDescriptionSet = (
    rubric: Rubric | undefined,
  ): Set<string> =>
    new Set(
      (rubric?.criteria || []).map((criterion) =>
        criterion.description.trim().toLowerCase(),
      ),
    );

  const handleImportSuccess = (newCriteria: Criteria[]) => {
    setRubric((prevRubric) => {
      const existingDescriptions = buildCriteriaDescriptionSet(prevRubric);

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

      return prevRubric
        ? {
            ...prevRubric,
            criteria: [...prevRubric.criteria, ...uniqueCriteria],
            pointsPossible:
              prevRubric.pointsPossible +
              uniqueCriteria.reduce(
                (sum, criterion) => sum + criterion.points,
                0,
              ),
          }
        : {
            title: "Imported Rubric",
            criteria: uniqueCriteria,
            pointsPossible: uniqueCriteria.reduce(
              (sum, criterion) => sum + criterion.points,
              0,
            ),
            key: "placeholder-key", // Placeholder
          };
    });
  };

  const handleImportError = (error: string) => {
    setErrorMessage(error);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={() => setShowVersionModal(true)}
        className="bg-blue-600 text-white font-bold rounded-lg py-2 px-4 transition duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Import CSV
      </button>
      <Dialog
        isOpen={showVersionModal}
        onClose={() => setShowVersionModal(false)}
        title="Select Import Version"
      >
        <div className="flex flex-col gap-4">
          <button
            onClick={() => triggerFile(VERSION_ONE)}
            className="bg-green-600 text-white font-bold rounded-lg py-2 px-4 transition duration-300 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Version 1 (Legacy)
          </button>
          <button
            onClick={() => triggerFile(VERSION_TWO)}
            className="bg-yellow-600 text-white font-bold rounded-lg py-2 px-4 transition duration-300 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            Version 2 (New)
          </button>
        </div>
      </Dialog>
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
      <label htmlFor="file-input" aria-label="file-input">
        <button className="hidden">Upload File</button>
      </label>
    </div>
  );
};

export default CSVUpload;
