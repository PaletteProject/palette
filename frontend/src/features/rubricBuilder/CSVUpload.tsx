import React, { useState } from "react";
import { importCsv } from "@utils";
import { Dialog } from "@components";

import { Criteria, Rubric } from "palette-types";
import { v4 as uuid } from "uuid";

interface CSVUploadProps {
  rubric: Rubric | undefined;
  setRubric: React.Dispatch<React.SetStateAction<Rubric | undefined>>;
}

export const CSVUpload: React.FC<CSVUploadProps> = ({ setRubric }) => {
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const closeErrorDialog = () => setErrorMessage(null);

  const handleFileChange = (
    file: File,
    version: "versionOne" | "versionTwo",
  ) => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (fileExtension !== "csv") {
      alert("Unsupported file format. Please upload a CSV file.");
      return;
    }

    importCsv(
      file,
      version,
      (newCriteria) => {
        updateRubric(newCriteria);
      },
      (error) => {
        setErrorMessage(error);
      },
    );
  };

  const updateRubric = (newCriteria: Criteria[]) => {
    setRubric((prevRubric) =>
      prevRubric
        ? {
            ...prevRubric,
            criteria: [...prevRubric.criteria, ...newCriteria],
            pointsPossible:
              prevRubric.pointsPossible +
              newCriteria.reduce((sum, criterion) => sum + criterion.points, 0),
          }
        : {
            id: parseInt(uuid(), 16),
            title: "Imported Rubric",
            criteria: newCriteria,
            pointsPossible: newCriteria.reduce(
              (sum, criterion) => sum + criterion.points,
              0,
            ),
            key: `rubric-${uuid()}`,
          },
    );
  };

  const handleVersionSelection = (version: "versionOne" | "versionTwo") => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".csv";
    fileInput.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        handleFileChange(file, version);
      }
    };
    fileInput.click();
    setShowVersionModal(false);
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
            onClick={() => handleVersionSelection("versionOne")}
            className="bg-green-600 text-white font-bold rounded-lg py-2 px-4 transition duration-300 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Version 1 (Legacy)
          </button>
          <button
            onClick={() => handleVersionSelection("versionTwo")}
            className="bg-yellow-600 text-white font-bold rounded-lg py-2 px-4 transition duration-300 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            Version 2 (New)
          </button>
        </div>
      </Dialog>
      {errorMessage && (
        <Dialog
          isOpen={!!errorMessage}
          onClose={closeErrorDialog}
          title="Error"
        >
          <p>{errorMessage}</p>
          <button
            onClick={closeErrorDialog}
            className="bg-red-600 text-white font-bold rounded-lg py-2 px-4 mt-4 transition duration-300 hover:bg-red-700 focus:outline-none"
          >
            OK
          </button>
        </Dialog>
      )}
    </div>
  );
};

export default CSVUpload;
