import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

interface PaletteEyeProps {
  onClick: () => void;
}

export const PaletteEye = ({ onClick }: PaletteEyeProps) => {
  return (
    <div onClick={onClick} className="cursor-pointer">
      <FontAwesomeIcon icon={faEye} />
    </div>
  );
};

export default PaletteEye;
