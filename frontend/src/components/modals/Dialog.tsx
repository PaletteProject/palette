// generic dialog component. Pass children to it that you want to display.

import { ReactNode } from "react";
import { createPortal } from "react-dom";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  if (!isOpen) {
    return null; // Don't render anything if the dialog is closed
  }

  return createPortal(
    <div className="scroll-auto fixed z-80 inset-0 bg-black bg-opacity-75 flex justify-center items-center">
      <div className="bg-gray-700 p-6 rounded shadow-lg relative w-1/3 max-w-4xl">
        <h2 className="text-xl text-white font-semibold j">{title}</h2>
        <div className={"text-gray-100"}>{children}</div>
        <button
          className="absolute top-2 right-2 text-2xl text-black font-bold hover:text-red-600 hover:scale-110 transition-colors ease-in-out duration-300"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </div>,
    document.getElementById("dialog-root") as HTMLElement, // use the dialog portal root!
  );
}
