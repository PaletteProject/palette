import React from "react";
import { PaletteActionButton } from "../buttons/PaletteActionButton.tsx";
import { useChoiceDialog } from "../../context/DialogContext.tsx";

export const ChoiceDialog = () => {
  const { isOpen, closeDialog, dialogConfig } = useChoiceDialog();
  if (!isOpen || !dialogConfig) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        {/* Title */}
        <div className="mb-4">
          <h2 className="text-center text-xl font-semibold text-gray-800">
            {dialogConfig.title}
          </h2>
        </div>

        {/* Message */}
        <div className="mb-6 flex justify-center">
          <p className="text-gray-700 text-center">{dialogConfig.message}</p>
        </div>

        {/* Buttons */}
        <div className="flex justify-around space-x-4">
          {dialogConfig.buttons.map((button, index) => (
            <PaletteActionButton
              color={button.color ?? "BLUE"}
              key={index}
              onClick={button.action}
              title={button.label}
              autoFocus={index === 0} // autofocus the first option
            />
          ))}
          {dialogConfig.excludeCancel ? (
            ""
          ) : (
            <PaletteActionButton
              color={"GRAY"}
              onClick={closeDialog}
              title={"Cancel"}
            />
          )}
        </div>
      </div>
    </div>
  );
};
