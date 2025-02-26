import { ReactElement } from "react";
import { useNavigate } from "react-router-dom";

export function OfflineGradingView(): ReactElement {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white">Offline Grading</h1>
      <p className="text-gray-300">
        This section allows grading without a Canvas token.
      </p>

      <button
        className="bg-gray-600 text-white py-2 px-4 mt-4 rounded"
        onClick={() => navigate("/grading")}
      >
        Back to Grading
      </button>
    </div>
  );
}
