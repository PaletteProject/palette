import React, {ChangeEvent, ReactElement, useEffect, useState} from "react";
import { Rating } from "palette-types";
import { Dialog } from "@components";
import { motion } from "framer-motion";

export default function RatingInput({
  ratingIndex,
  rating,
  handleRatingChange,
  handleRemoveRating,
}: {
  ratingIndex: number;
  rating: Rating;
  handleRemoveRating: (index: number) => void;
  handleRatingChange: (index: number, updatedRating: Rating) => void;
}): ReactElement {

  /**
   * Rating state
   */
  const [points, setPoints] = useState<number>(rating.points);
  const [title, setTitle] = useState<string>(rating.description);
  const [description, setDescription] = useState<string>(rating.longDescription);

  /**
   * Dialog state
   */
    // temp state used for form entries, only updating the actual rating state on a save
  const [tempTitle, setTempTitle] = useState<string>(rating.description);
  const [tempDescription, setTempDescription] = useState<string>(rating.longDescription);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /**
   * Rating functionality
   */
  const handlePointChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newPointValue = Number(event.target.value);
    setPoints(newPointValue); // update input value in state
    const newRating = { ...rating, points: newPointValue };
    handleRatingChange(ratingIndex, newRating); // trigger parent update
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTempTitle(event.target.value); // update input value in state
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setTempDescription(event.target.value); // update state to show latest input
  };

  /**
   * Update permanent state with new values.
   */
  const handleSaveRating = () => {
    setTitle(tempTitle);
    setDescription(tempDescription);

    // use temp values directly since state updates are asynchronous
    const newRating = {...rating, description:tempTitle, longDescription: tempDescription}
    handleRatingChange(ratingIndex, newRating)

    handleMenuClose();
  }

  /**
   * Hook to sync the input value temp state with actual rating values whenever they change.
   *
   * isDialogOpen in the dependency array ensures the values are synced prior to the user seeing the dialog. The
   * conditional ensures temp state only updates if it's needed.
   */
  useEffect(() => {

    if (isDialogOpen) {
      setTempTitle(rating.description)
      setTempDescription(rating.longDescription)
    }

  }, [isDialogOpen, rating])


  /**
   * Triggers rating removal from parent criterion.
   * @param event
   */
  const handleRemoveRatingPress = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    handleRemoveRating(ratingIndex); // trigger removal
  };

  const handleMenuClose = () => {
    setIsDialogOpen(false);
  }

  /**
   * JSX for rendering the rating popup menu.
   */
  const renderRatingMenu = () => {
    return (
      <div className={"grid gap-6 mt-4"}>
        <div className={"grid gap-2"}>
          <label>Edit Title</label>
          <input
            placeholder={"Enter a title..."}
            value={tempTitle}
            type="text"
            className={"p-2 text-black"}
            onChange={handleTitleChange}
          />
        </div>
        <div className={"grid gap-2"}>
          <label>Edit Description</label>
          <textarea
            value={tempDescription}
            placeholder={"Enter a description..."}
            onChange={handleDescriptionChange}
            className={"text-black p-2 resize-none"}
            cols={60}
            rows={4}
          />
        </div>
        <div className={"flex gap-2 justify-self-end"}>
          <button type={"button"} onClick={handleMenuClose}>
            Cancel
          </button>
          <button type={"button"} onClick={handleSaveRating}>Save</button>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      layout
      transition={{
        layout: {
          type: "spring",
          stiffness: 105,
          damping: 10,
        },
      }}
      className={
        "grid gap-2 grid-rows-2 border-2" +
        " border-indigo-500 w-36 h-48 p-2 rounded-xl"
      }
    >
      <div className={"grid gap-2"}>
        <div className={"flex gap-2 relative"}>
          <input
            type={"number"}
            className={"px-3 w-16 rounded-full text-black"}
            value={points}
            onChange={handlePointChange}
            min={0}
            max={100}
          />
          <span>Points</span>
        </div>
        <p className={"text-sm font-medium"}>{title}</p>
      </div>
      <div className={"text-xs relative"}>{description}</div>
      <div className={"flex justify-between items-center"}>
        <button
          onClick={() => setIsDialogOpen(true)}
          type={"button"}
          className={
            "rounded-full bg-indigo-600 w-10 p-2 hover:opacity-80 active:opacity-70"
          }
        >
          <img
            src={"paint-palette.png"}
            alt={"Edit Rating"}
            className={"w-6 h-6"}
          />
        </button>
        <button
          onClick={handleRemoveRatingPress}
          className={
            "rounded-full h-8 w-8 text-xl font-light relative" +
            " -right-2 -bottom-2 hover:text-red-500"
          }
          tabIndex={-1} //ensure the remove buttons aren't tabbable
        >
          x
        </button>
      </div>
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={"Edit Rating"}
      >
        {renderRatingMenu()}
      </Dialog>
    </motion.div>
  );
}
