import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils.ts";

interface PaletteEyeProps {
  onClick: () => void;
  focused: boolean;
}

export const PaletteEye = ({ onClick, focused }: PaletteEyeProps) => {
  return (
    <div onClick={onClick}>
      <FontAwesomeIcon
        icon={focused ? faEyeSlash : faEye}
        title="View Existing Feedback"
        className={cn(
          "hover:opacity-50",
          `cursor-pointer ${focused ? "text-blue-400" : "text-white"}`,
        )}
      />
    </div>
  );
};

export default PaletteEye;
