import React, { ReactElement } from "react";

type ActionButtonProps = {
  /**
   * The function to call when the button is clicked.
   * It can either take a `React.MouseEvent` as a parameter or no parameters.
   */
  onClick?:
    | ((event: React.MouseEvent<HTMLButtonElement>) => void)
    | (() => void);

  onPointerDown?:
    | ((event: React.MouseEvent<HTMLButtonElement>) => void)
    | (() => void);

  /**
   * The title of the item being saved (e.g., rubric, settings, etc.).
   */
  title?: string;

  autoFocus?: boolean;

  /**
   * The button color theme.
   */
  color: "GREEN" | "RED" | "BLUE" | "YELLOW" | "PURPLE" | "GRAY";
};

/**
 * A button component that triggers the provided `onClick` function when clicked.
 *
 * @param {ActionButtonProps} props - The properties for the SaveButton component.
 * @returns {ReactElement} The rendered SaveButton component.
 */
export const PaletteActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  onPointerDown,
  title = "Save",
  color,
  autoFocus = false,
}: ActionButtonProps): ReactElement => {
  const colorStyles = {
    GREEN: {
      bg: "bg-green-600",
      hover: "hover:bg-green-700",
      focus: "focus:ring-green-500",
    },
    RED: {
      bg: "bg-red-600",
      hover: "hover:bg-red-700",
      focus: "focus:ring-red-500",
    },
    BLUE: {
      bg: "bg-blue-600",
      hover: "hover:bg-blue-700",
      focus: "focus:ring-blue-400",
    },
    YELLOW: {
      bg: "bg-yellow-600",
      hover: "hover:bg-yellow-700",
      focus: "focus:ring-yellow-500",
    },
    PURPLE: {
      bg: "bg-purple-600",
      hover: "hover:bg-purple-700",
      focus: "focus:ring-purple-500",
    },
    GRAY: {
      bg: "bg-gray-600",
      hover: "hover:bg-gray-700",
      focus: "focus:ring-gray-500",
    },
  }[color];

  return (
    <button
      className={`transition-transform duration-200 ease-in-out transform 
        ${colorStyles.bg} ${colorStyles.hover} 
        text-white font-bold rounded-lg py-2 px-4 
        hover:scale-105 focus:outline-none focus:ring-4 ${colorStyles.focus} focus:shadow-2xl`}
      onClick={onClick}
      onPointerDown={onPointerDown}
      type="button"
      title={title}
      aria-label={title}
      autoFocus={autoFocus}
    >
      {title}
    </button>
  );
};
