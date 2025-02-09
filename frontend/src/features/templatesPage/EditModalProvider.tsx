import React, { createContext, useContext, useState } from "react";

interface EditModalContextType {
  isEditModalOpen: boolean;
  setIsEditModalOpen: (isOpen: boolean) => void;
}

const EditModalContext = createContext<EditModalContextType>({
  isEditModalOpen: false,
  setIsEditModalOpen: () => {},
});

export function useEditModal() {
  return useContext(EditModalContext);
}

export function EditModalProvider({ children }: { children: React.ReactNode }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <EditModalContext.Provider value={{ isEditModalOpen, setIsEditModalOpen }}>
      {children}
    </EditModalContext.Provider>
  );
}
