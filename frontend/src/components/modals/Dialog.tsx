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
    <div className="scroll-auto fixed z-40 inset-0 bg-black bg-opacity-75 flex justify-center items-center">
      <div className="bg-gray-700 p-6 rounded shadow-lg relative md:w-3/5">
        <h2 className="text-2xl text-white font-semibold">{title}</h2>
        <div className={"text-gray-100"}>{children}</div>
        <button
          className="absolute top-2 right-2 text-2xl cursor-pointer text-black font-bold hover:text-red-600 hover:scale-110 transition-colors ease-in-out duration-300"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </div>,
    document.getElementById("portal-root") as HTMLElement, // render outside the primary DOM to ensure modals are in
    // front of everything else
  );
}
