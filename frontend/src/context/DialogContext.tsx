import { createContext, ReactNode, useContext, useState } from "react";
import { ButtonColorOptions } from "@/components";

type DialogButton = {
  label: string; // text to display on the button
  action: () => void; // function to call when button is clicked
  autoFocus?: boolean; // whether the choice should be automatically focused on render
  color?: ButtonColorOptions; // optional color override
};

type DialogConfig = {
  title: string;
  message: string;
  buttons: DialogButton[];
  excludeCancel?: boolean;
};

type DialogContextType = {
  isOpen: boolean;
  openDialog: (config: DialogConfig) => void;
  closeDialog: () => void;
  dialogConfig: DialogConfig | null;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);

  const openDialog = (config: DialogConfig) => {
    setDialogConfig(config); // apply configuration
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setDialogConfig(null); // reset dialog for next use
  };

  return (
    <DialogContext.Provider
      value={{ isOpen, openDialog, closeDialog, dialogConfig }}
    >
      {children}
    </DialogContext.Provider>
  );
};

export const useChoiceDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
};
