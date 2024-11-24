import React, { useState } from "react";
import { importCsv } from "../../utils/CSVParser"; // Import the utility
import { Criteria, Rubric } from "palette-types";
import { v4 as uuid } from "uuid";

interface CSVUploadProps {
  rubric: Rubric | undefined;
  setRubric: React.Dispatch<React.SetStateAction<Rubric | undefined>>;
}

export const CSVUpload: React.FC<CSVUploadProps> = ({ setRubric }) => {
  const [showVersionModal, setShowVersionModal] = useState(false);

  const handleFileChange = (
    file: File,
    version: "versionOne" | "versionTwo",
  ) => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (fileExtension !== "csv") {
      alert("Unsupported file format. Please upload a CSV file.");
      return;
    }

    importCsv(file, version, (newCriteria) => {
      updateRubric(newCriteria);
    });
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

      {showVersionModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black bg-opacity-90 flex justify-center items-center z-50">
          <div className="bg-gray-800 text-white rounded-lg shadow-2xl p-6 w-96">
            <h2 className="text-2xl font-extrabold mb-4 text-center">
              Select Import Version
            </h2>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleVersionSelection("versionOne")}
                className="bg-green-600 text-white font-bold rounded-lg py-2 px-4 transition duration-300 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Version 1
              </button>
              <button
                onClick={() => handleVersionSelection("versionTwo")}
                className="bg-yellow-600 text-white font-bold rounded-lg py-2 px-4 transition duration-300 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                Version 2
              </button>
              <button
                onClick={() => setShowVersionModal(false)}
                className="bg-red-600 text-white font-bold rounded-lg py-2 px-4 transition duration-300 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVUpload;
