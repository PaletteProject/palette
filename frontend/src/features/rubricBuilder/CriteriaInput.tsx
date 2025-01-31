import {
  ChangeEvent,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  useEffect,
  useState,
} from "react";

import { useSortable } from "@dnd-kit/sortable"; // Import useSortable
import { CSS } from "@dnd-kit/utilities"; // Import CSS utilities
import { Criteria, Rating } from "palette-types";
import { createRating } from "@utils";
import { RatingInput } from "./RatingInput";
import TemplateSetter from "./TemplateSetter";
import { Dialog } from "@components";
import { motion } from "framer-motion";

export default function CriteriaInput({
  index,
  activeCriterionIndex,
  criterion,
  handleCriteriaUpdate,
  removeCriterion,
  setActiveCriterionIndex,
}: {
  index: number;
  activeCriterionIndex: number;
  criterion: Criteria;
  handleCriteriaUpdate: (index: number, criterion: Criteria) => void;
  removeCriterion: (index: number, criterion: Criteria) => void;
  setActiveCriterionIndex: (index: number) => void;
}): ReactElement {
  const [ratings, setRatings] = useState<Rating[]>(criterion.ratings);
  const [maxPoints, setMaxPoints] = useState<number>(0); // Initialize state for max points
  const [templateSetterActive, setTemplateSetterActive] = useState(false); // file input display is open or not
  const [criteriaDescription, setCriteriaDescription] = useState(
    criterion.description || "",
  );

  const [templateTitle, setTemplateTitle] = useState(criterion.template || "");

  /**
   * Whenever ratings change, recalculate criterion's max points
   */
  useEffect(() => {
    // sort ratings in descending order by points
    const sortedRatings = [...ratings].sort((a, b) => b.points - a.points);

    // Only update state if the sorted array is different from the current ratings
    if (JSON.stringify(ratings) !== JSON.stringify(sortedRatings)) {
      setRatings(sortedRatings);
    }

    // calculate max points after sorting
    const maxRating = sortedRatings[0]?.points || 0; // defaults to 0 if ratings array is empty
    setMaxPoints(maxRating);

    // update criterion with new max points value
    const newCriterion = { ...criterion, points: maxRating };
    handleCriteriaUpdate(index, newCriterion);
  }, [ratings]);

  /**
   * useEffect hook to ghost the add ratings button when 4 ratings are rendered.
   *
   * Related button styles and state.
   */
  const addButtonActiveStyle =
    "transition-all ease-in-out duration-300 bg-violet-600 text-white font-bold rounded-lg px-4" +
    " py-2 justify-self-end hover:bg-violet-700 focus:ring-2 focus:ring-violet-500 focus:outline-none";

  const addButtonInactiveStyle =
    "transition-all ease-in-out duration-300 bg-violet-200 text-violet-600 font-bold rounded-lg px-4" +
    " py-2 justify-self-end hover:bg-violet-300 focus:ring-2 focus:ring-violet-500 focus:outline-none opacity-50 cursor-not-allowed";

  /**
   * Criteria change functionality.
   */

  const handleDescriptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newDescription = event.target.value;
    setCriteriaDescription(newDescription);

    const newCriterion = { ...criterion, description: newDescription };
    handleCriteriaUpdate(index, newCriterion);
  };

  const handleRemoveCriteriaButton = (
    event: ReactMouseEvent,
    index: number,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    removeCriterion(index, criterion);
  };

  // Update criterion when ratings change.
  const handleRatingChange = (ratingIndex: number, updatedRating: Rating) => {
    const updatedRatings = ratings.map((rating, index) =>
      index === ratingIndex ? updatedRating : rating,
    );
    setRatings(updatedRatings);
    criterion.ratings = updatedRatings;
    handleCriteriaUpdate(index, criterion);
  };

  const handleSetTemplateTitle = (event: ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    setTemplateTitle(newTitle);
    const newCriterion = { ...criterion, templateTitle: templateTitle };
    handleCriteriaUpdate(index, newCriterion);
  };

  // Update criterion when a rating is removed
  const handleRemoveRating = (ratingIndex: number) => {
    const updatedRatings = ratings.filter((_, i) => i !== ratingIndex);
    setRatings(updatedRatings);
    criterion.ratings = updatedRatings;
    handleCriteriaUpdate(index, criterion);
  };

  const renderRatingOptions = () => {
    return ratings.map((rating: Rating, ratingIndex: number) => {
      return (
        <RatingInput
          key={rating.key}
          ratingIndex={ratingIndex}
          rating={rating}
          handleRatingChange={handleRatingChange}
          handleRemoveRating={handleRemoveRating}
        />
      );
    });
  };

  const handleAddRating = (
    event: ReactMouseEvent<HTMLButtonElement>,
    index: number,
  ) => {
    event.preventDefault();

    if (ratings.length >= 4) return; // limit max of 4 ratings to be added
    const updatedRatings = ratings.slice(0);
    updatedRatings.push(createRating(ratings.length));
    setRatings(updatedRatings);
    criterion.ratings = ratings;
    handleCriteriaUpdate(index, criterion);
  };

  const handleExpandCriterion = () => {
    setActiveCriterionIndex(index);
  };

  const handleTemplateSetterPress = (
    event: ReactMouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    if (!templateSetterActive) {
      setTemplateSetterActive(true);
    }
  };

  const renderTemplateSetter = () => {
    //console.log("Test");
    if (templateSetterActive) {
      return (
        <TemplateSetter
          closeTemplateCard={handleCloseTemplateSetter}
          handleSetTemplateTitle={handleSetTemplateTitle}
          criterion={criterion}
        />
      );
    }
  };

  const handleCloseTemplateSetter = () => {
    setTemplateSetterActive(false); // hides the template setter
  };

  // Use the useSortable hook to handle criteria ordering
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: criterion.key,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderCondensedView = () => {
    return (
      <div
        ref={setNodeRef} // Set the ref here for the sortable functionality
        style={style} // Apply the sortable style
        {...attributes} // Spread the attributes
        {...listeners} // Spread the listeners
        className={`hover:bg-gray-500 hover:cursor-pointer max-h-12 flex justify-between items-center border border-gray-700 shadow-xl p-6 rounded-lg w-full bg-gray-700
        }`}
        onDoubleClick={handleExpandCriterion}
      >
        <div className="text-gray-300">
          <strong>{criteriaDescription}</strong> - Max Points: {maxPoints}
        </div>
        <div className={"flex gap-3"}>
          <button
            onPointerDown={(
              event: ReactMouseEvent, // Change to onPointerDown
            ) => handleRemoveCriteriaButton(event, index)}
            type={"button"}
            className="transition-all ease-in-out duration-300 bg-red-600 text-white font-bold rounded-lg px-2 py-1 hover:bg-red-700 focus:outline-none border-2 border-transparent"
          >
            Remove
          </button>
          <button
            onPointerDown={handleExpandCriterion}
            type={"button"}
            className="transition-all ease-in-out duration-300 bg-emerald-600 text-white font-bold rounded-lg px-2 py-1 hover:bg-emerald-700 focus:outline-none border-2 border-transparent"
          >
            Edit
          </button>
        </div>
      </div>
    );
  };

  const renderDetailedView = () => {
    /**
     * Dynamically change gap between rating cards based on how many are rendered simultaneously.
     */
    const calculateGap = () => {
      switch (ratings.length) {
        case 1:
          return "";
        case 2:
          return "gap-3";
        case 3:
          return "gap-2";
        case 4:
          return "gap-1";
      }
    };

    return (
      <div
        className={
          " grid  grid-rows-[1fr_5fr_1fr] shadow-xl p-6 rounded-lg w-full bg-gray-700"
        }
        onDoubleClick={(event) => {
          // check if the clicked target is the card itself to avoid messing with child elements
          if (event.target === event.currentTarget) {
            setActiveCriterionIndex(-1);
          }
        }}
      >
        {/* Card style and main grid layout for content*/}

        <input
          type="text"
          placeholder={`Criteria ${index + 1} Description...`}
          className="rounded-lg p-3 text-gray-300 border border-gray-600 bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-800"
          value={criteriaDescription}
          onChange={handleDescriptionChange}
        />

        <motion.div
          layout
          className={`grid ${calculateGap()} grid-flow-col m-auto max-w-full`}
        >
          {renderRatingOptions()}
        </motion.div>

        <div className={"flex gap-3 items-end justify-between"}>
          <div className="flex gap-3">
            <button
              onPointerDown={(event: ReactMouseEvent<HTMLButtonElement>) =>
                handleRemoveCriteriaButton(event, index)
              }
              className={
                "transition-all ease-in-out duration-300 bg-red-600 text-white font-bold rounded-lg px-4" +
                " py-2 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
              }
              type={"button"}
            >
              Remove
            </button>
            <button
              className={
                "transition-all ease-in-out duration-300 bg-amber-600 text-white font-bold rounded-lg px-4" +
                " py-2 hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              }
              onPointerDown={() => {
                setActiveCriterionIndex(-1); // setting the index to -1 will ensure the current criteria will
                // condense and another one won't open
              }}
              type={"button"}
            >
              Collapse
            </button>
            <button
              className={
                "transition-all ease-in-out duration-300 bg-slate-600 rounded-full px-2" +
                " py-2 hover:bg-slate-700 focus:ring-2 focus:ring-slate-500 focus:outline-none"
              }
              onClick={handleTemplateSetterPress}
              type={"button"}
            >
              +
            </button>
            <button
              className={
                ratings.length < 4
                  ? addButtonActiveStyle
                  : addButtonInactiveStyle
              }
              onClick={(event: ReactMouseEvent<HTMLButtonElement>) =>
                handleAddRating(event, index)
              }
              type={"button"}
              disabled={ratings.length >= 4}
            >
              Add Rating
            </button>

            <Dialog
              isOpen={templateSetterActive}
              onClose={() => setTemplateSetterActive(false)}
              title={
                "Add common criteria to a Template for faster building in the future!"
              }
            >
              {renderTemplateSetter()}
            </Dialog>
          </div>
          <p className="text-xl font-semibold mt-2 text-gray-200 bg-gray-500 px-3 py-1 rounded-full">
            Max Points: {maxPoints}
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      {activeCriterionIndex === index
        ? renderDetailedView()
        : renderCondensedView()}
    </>
  );
}
