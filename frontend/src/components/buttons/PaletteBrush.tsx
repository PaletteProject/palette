import { faPaintbrush } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type PaletteBrushProps = {
  onClick: () => void;
  title: string;
  focused: boolean;
};

export const PaletteBrush = ({
  onClick,
  title,
  focused,
}: PaletteBrushProps) => {
  return (
    <FontAwesomeIcon
      icon={faPaintbrush}
      onClick={onClick}
      className={`cursor-pointer ${focused ? "text-blue-400" : "text-white"}`}
      title={title}
    />
  );
};

export default PaletteBrush;
