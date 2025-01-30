import React from "react";

/**
 * This generic component is a modal dialog that presents a message and a set of choices.
 * The choices are rendered as buttons at the bottom of the dialog.
 */
interface PopUpProps {
  show: boolean; // Whether the dialog is visible
  onHide: () => void; // The function to call when the dialog is closed
  title: string; // The title of the dialog
  message: string; // The message to display in the dialog
}

export const PopUp: React.FC<PopUpProps> = ({
  show,
  onHide,
  title,
  message,
}) => {
  if (!show) {
    return null; // Don't render anything if the modal is not visible
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        {/* Title */}
        <div className="mb-4">
          <h2 className="text-center text-xl font-semibold text-gray-800">
            {title}
          </h2>
        </div>

        {/* Message */}
        <div className="mb-6 flex justify-center">
          <p className="text-gray-700 text-center">{message}</p>
        </div>

        <div className="flex justify-around space-x-4">
          <button
            className="py-2 px-4 rounded bg-red-500 hover:bg-red-600 text-white"
            onClick={onHide}
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};
