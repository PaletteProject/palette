import React, { ReactElement } from "react";

type ActionButtonProps = {
  /**
   * The function to call when the button is clicked.
   * It can either take a `React.MouseEvent` as a parameter or no parameters.
   */
  onClick:
    | ((event: React.MouseEvent<HTMLButtonElement>) => void)
    | (() => void);
  /**
   * The title of the item being saved (e.g., rubric, settings, etc.).
   */
  title: string;
  color: "GREEN" | "RED" | "BLUE";
};

/**
 * A button component that triggers the provided `onClick` function when clicked.
 *
 * @param {ActionButtonProps} props - The properties for the SaveButton component.
 * @returns {ReactElement} The rendered SaveButton component.
 */
export const PaletteActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  title,
  color,
}: ActionButtonProps): ReactElement => {
  const DEFAULT_TITLE = "Save";

  let BACKGROUND_COLOR;
  let HOVER_COLOR;
  let FOCUS_RING_COLOR;

  switch (color) {
    case "GREEN":
      BACKGROUND_COLOR = "bg-green-600";
      HOVER_COLOR = "hover:bg-green-700";
      FOCUS_RING_COLOR = "focus:ring-green-500";
      break;
    case "RED":
      BACKGROUND_COLOR = "bg-red-600";
      HOVER_COLOR = "hover:bg-red-700";
      FOCUS_RING_COLOR = "focus:ring-red-500";
      break;
    case "BLUE":
      BACKGROUND_COLOR = "bg-blue-600";
      HOVER_COLOR = "hover:bg-blue-700";
      FOCUS_RING_COLOR = "focus:ring-blue-500";
  }

  /**
   * Handles the button click event and calls the provided `onClick` function.
   *
   * @param {React.MouseEvent<HTMLButtonElement>} event - The mouse event triggered by clicking the button.
   */
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // if # of params > 0
    if (onClick.length > 0) {
      (onClick as (event: React.MouseEvent<HTMLButtonElement>) => void)(event);
    } else {
      (onClick as () => void)();
    }
  };

  return (
    <button
      className={`transition-all ease-in-out duration-300 ${BACKGROUND_COLOR} text-white font-bold rounded-lg py-2 px-4 ${HOVER_COLOR} hover:scale-105 focus:outline-none focus:ring-2 ${FOCUS_RING_COLOR}`}
      onClick={handleClick}
      type={"button"}
      title={title}
    >
      {title ? `${title}` : DEFAULT_TITLE}
    </button>
  );
};
