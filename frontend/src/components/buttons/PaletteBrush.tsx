import { faPaintbrush } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cn } from "@/lib/utils.ts";

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
      className={cn(
        "hover:opacity-50",
        `cursor-pointer ${focused ? "text-blue-400" : "text-white"}`,
      )}
      title={title}
    />
  );
};

export default PaletteBrush;
