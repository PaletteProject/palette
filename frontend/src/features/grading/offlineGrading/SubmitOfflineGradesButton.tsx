import React from "react";
import { aggregateOfflineGrades } from "./aggregateOfflineGrades";
import { submitGradesToCanvas } from "./submitGradesToCanvas";

interface SubmitOfflineGradesButtonProps {
  courseId: string;
  assignmentId: string;
  accessToken: string;
}

export const SubmitOfflineGradesButton: React.FC<
  SubmitOfflineGradesButtonProps
> = ({ courseId, assignmentId, accessToken }) => {
  const handleSubmit = async () => {
    try {
      const grades = aggregateOfflineGrades(courseId, assignmentId);

      if (Object.keys(grades).length === 0) {
        alert("No offline grades found to submit.");
        return;
      }

      await submitGradesToCanvas(courseId, assignmentId, grades, accessToken);
      alert("Offline grades successfully submitted to Canvas!");
    } catch (error) {
      console.error("Error submitting grades:", error);
      alert("An error occurred while submitting grades.");
    }
  };

  return (
    <button
      className="bg-green-600 text-white"
      onClick={() => {
        void handleSubmit();
      }}
    >
      Submit to Canvas Through Offline Grading
    </button>
  );
};
