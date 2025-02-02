import React from "react";

/**
 * A choice is a button that the user can click to perform an action.
 */
interface Choice {
  label: string; // The text to display on the button
  action: () => void; // The function to call when the button is clicked
  variant?: string; // The variant of the button (e.g., "primary", "secondary")
}

/**
 * This generic component is a modal dialog that presents a message and a set of choices.
 * The choices are rendered as buttons at the bottom of the dialog.
 */
interface ModalChoiceDialogProps {
  show: boolean; // Whether the dialog is visible
  onHide: () => void; // The function to call when the dialog is closed
  title: string; // The title of the dialog
  message: string; // The message to display in the dialog
  choices: Choice[]; // The button choices (not including cancel) to present to the user
}

export const ModalChoiceDialog: React.FC<ModalChoiceDialogProps> = ({
  show,
  onHide,
  title,
  message,
  choices,
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

        {/* Buttons */}
        <div className="flex justify-around space-x-4">
          {choices.map((choice, index) => (
            <button
              key={index}
              autoFocus={index === 0} // autofocus the first option
              className={`py-2 px-4 rounded text-white focus:outline-0 focus:ring-4 focus:ring-blue-400 transform transition-transform focus:scale-105  ${
                choice.variant === "secondary"
                  ? "bg-gray-500 hover:bg-gray-600"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={choice.action}
            >
              {choice.label}
            </button>
          ))}
          <button
            className="py-2 px-4 rounded bg-gray-500 hover:bg-gray-600 focus:outline-0 focus:ring-4 focus:ring-gray-400 text-white transform transition-transform focus:scale-105 "
            onClick={onHide}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
