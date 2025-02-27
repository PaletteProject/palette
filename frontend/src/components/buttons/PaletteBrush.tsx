import { faPaintbrush } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type PalettePencilProps = { onClick: () => void; title: string };

export const PalettePencil = ({ onClick, title }: PalettePencilProps) => {
  return (
    <FontAwesomeIcon
      icon={faPaintbrush}
      onClick={onClick}
      className="cursor-pointer"
      title={title}
    />
  );
};

export default PalettePencil;
