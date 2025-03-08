import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

interface PaletteTrashProps {
  onClick: () => void;
  title: string;
}

export const PaletteTrash = ({ onClick, title }: PaletteTrashProps) => {
  return (
    <div>
      <FontAwesomeIcon
        icon={faTrash}
        className="cursor-pointer text-2xl text-gray-400 font-bold hover:text-red-600 hover:scale-110 transition-colors ease-in-out duration-300"
        onClick={onClick}
        title={title}
      />
    </div>
  );
};

export default PaletteTrash;
