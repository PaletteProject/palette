import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTable } from "@fortawesome/free-solid-svg-icons";

interface PaletteTableProps {
  onClick: () => void;
  focused?: boolean;
}

export const PaletteTable = ({ onClick, focused }: PaletteTableProps) => {
  return (
    <div onClick={onClick}>
      <FontAwesomeIcon
        icon={faTable}
        title="Filter Table"
        className={`cursor-pointer ${focused ? "text-blue-400" : "text-gray-400"}`}
      />
    </div>
  );
};

export default PaletteTable;
