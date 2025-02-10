import React from "react";
import {
  ButtonColorOptions,
  PaletteActionButton,
} from "../buttons/PaletteActionButton.tsx";

/**
 * A choice is a button that the user can click to perform an action.
 */
export interface Choice {
  label: string; // The text to display on the button
  action: () => void; // The function to call when the button is clicked
  autoFocus: boolean; // whether the choice should be automatically focused on render
  color?: ButtonColorOptions; // optional color override
}

export interface Modal {
  show: boolean; // Whether the dialog is visible

  title: string; // The title of the dialog
  message: string; // The message to display in the dialog
  choices: Choice[]; // The button choices (not including cancel) to present to the user
  excludeCancel?: boolean; // option to exclude cancel button
}

/**
 * This generic component is a modal dialog that presents a message and a set of choices.
 * The choices are rendered as buttons at the bottom of the dialog.
 */
interface ChoiceDialogProps {
  modal: Modal;
  onHide: () => void; // The function to call when the dialog is closed
}

export const ChoiceDialog: React.FC<ChoiceDialogProps> = ({
  modal,
  onHide,
}) => {
  if (!modal.show) {
    return null; // Don't render anything if the modal is not visible
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        {/* Title */}
        <div className="mb-4">
          <h2 className="text-center text-xl font-semibold text-gray-800">
            {modal.title}
          </h2>
        </div>

        {/* Message */}
        <div className="mb-6 flex justify-center">
          <p className="text-gray-700 text-center">{modal.message}</p>
        </div>

        {/* Buttons */}
        <div className="flex justify-around space-x-4">
          {modal.choices.map((choice, index) => (
            <PaletteActionButton
              color={choice.color ?? "BLUE"}
              key={index}
              onClick={choice.action}
              title={choice.label}
              autoFocus={index === 0} // autofocus the first option
            />
          ))}
          {modal.excludeCancel ? (
            ""
          ) : (
            <PaletteActionButton
              color={"GRAY"}
              onClick={onHide}
              title={"Cancel"}
            />
          )}
        </div>
      </div>
    </div>
  );
};
