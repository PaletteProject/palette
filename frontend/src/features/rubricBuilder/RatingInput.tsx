import React, { ChangeEvent, ReactElement, useState } from "react";
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
   * Rating data
   *
   * State
   */
  const [points, setPoints] = useState<number>(rating.points);
  const [title, setTitle] = useState<string>(rating.description);
  const [description, setDescription] = useState<string>(
    rating.longDescription,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /**
   * Rating data
   *
   * Functionality
   */
  const handlePointChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newPointValue = Number(event.target.value);
    setPoints(newPointValue); // update input value in state
    const newRating = { ...rating, points: newPointValue };
    handleRatingChange(ratingIndex, newRating); // trigger parent update
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    setTitle(newTitle); // update input value in state
    const newRating = { ...rating, description: newTitle };
    handleRatingChange(ratingIndex, newRating); // trigger parent update
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = event.target.value;
    setDescription(newDescription); // update state to show latest input
    const updatedRating = { ...rating, longDescription: newDescription };
    handleRatingChange(ratingIndex, updatedRating);
  };

  const handleRemoveRatingPress = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    handleRemoveRating(ratingIndex); // trigger removal
  };

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
            value={title}
            type="text"
            className={"p-2 text-black"}
            onChange={handleTitleChange}
          />
        </div>
        <div className={"grid gap-2"}>
          <label>Edit Description</label>
          <textarea
            value={description}
            placeholder={"Enter a description..."}
            onChange={handleDescriptionChange}
            className={"text-black p-2 resize-none"}
            cols={60}
            rows={4}
          />
        </div>
        <div className={"flex gap-2 justify-self-end"}>
          <button type={"button"} onClick={() => setIsDialogOpen(false)}>
            Cancel
          </button>
          <button type={"button"}>Save</button>
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
