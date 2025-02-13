import { useEffect, useState } from "react";

export function ProgressBar({ progress }: { progress: number }) {
  const [progressBarColor, setProgressBarColor] =
    useState<string>("bg-green-500");

  const GREEN_PROGRESS = 70;
  const YELLOW_PROGRESS = 50;

  useEffect(() => {
    setProgressBarColor(
      progress > GREEN_PROGRESS
        ? "bg-green-500"
        : progress > YELLOW_PROGRESS
          ? "bg-yellow-600"
          : "bg-red-500",
    );
  });
  return (
    <div className="bg-gray-800 p-2 rounded-2xl items-center grid shadow-2xl">
      <div className="relative w-full h-6 bg-gray-900 rounded-2xl overflow-hidden">
        {/* Progress Bar */}
        <div
          className={`absolute top-0 left-0 h-full ${progressBarColor}`}
          style={{ width: `${progress}%` }}
        ></div>
        {/* Centered Progress Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-white font-extrabold">{progress}% Graded</h2>
        </div>
      </div>
    </div>
  );
}
