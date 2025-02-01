// modal for editing a template

import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useEditModal } from "../../features/templatesPage/EditModalProvider.tsx";

interface EditTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function EditTemplateModal({ children }: EditTemplateModalProps) {
  const { isEditModalOpen, setIsEditModalOpen } = useEditModal();
  if (!isEditModalOpen) {
    return null; // Don't render anything if the dialog is closed
  }

  return createPortal(
    <div className="scroll-auto fixed z-80 inset-0 bg-black bg-opacity-75 flex justify-center items-center">
      <div className="bg-gray-700 p-4 sm:p-6 rounded shadow-lg relative w-[95%] sm:w-full max-w-xl sm:max-w-2xl md:max-w-3xl mx-2">
        <div className={"text-gray-100"}>{children}</div>
        <button
          className="absolute top-2 right-2 text-2xl text-black font-bold hover:text-red-600 hover:scale-110 transition-colors ease-in-out duration-300"
          onClick={() => setIsEditModalOpen(false)}
        >
          ✕
        </button>
      </div>
    </div>,
    document.getElementById("modal-portal") as HTMLElement // use the dialog portal root!
  );
}
