import { faPaintbrush } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type PaletteBrushProps = { onClick: () => void; title: string };

export const PaletteBrush = ({ onClick, title }: PaletteBrushProps) => {
  return (
    <FontAwesomeIcon
      icon={faPaintbrush}
      onClick={onClick}
      className="cursor-pointer"
      title={title}
    />
  );
};

export default PaletteBrush;
