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
import { RatingCard } from "./RatingCard.tsx";
import TemplateSetter from "./TemplateSetter.tsx";
import { Dialog, PaletteActionButton } from "@components";
import { motion } from "framer-motion";

type CriteriaCardProps = {
  index: number;
  activeCriterionIndex: number;
  criterion: Criteria;
  handleCriteriaUpdate: (index: number, criterion: Criteria) => void;
  removeCriterion: (index: number, criterion: Criteria) => void;
  setActiveCriterionIndex: (index: number) => void;
};

export default function CriteriaCard({
  index,
  activeCriterionIndex,
  criterion,
  handleCriteriaUpdate,
  removeCriterion,
  setActiveCriterionIndex,
}: CriteriaCardProps): ReactElement {
  const [ratings, setRatings] = useState<Rating[]>(criterion.ratings);
  const [maxPoints, setMaxPoints] = useState<number>(0); // Initialize state for max points
  const [templateSetterActive, setTemplateSetterActive] = useState(false); // file input display is open or not
  const [criteriaDescription, setCriteriaDescription] = useState(
    criterion.description || "",
  );
  const [groupCriteria, setGroupCriteria] = useState<boolean>(
    criterion.isGroupCriterion,
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
    const newCriterion = { ...criterion, pointsPossible: maxRating };
    handleCriteriaUpdate(index, newCriterion);
  }, [ratings]);

  /**
   * Criteria change functionality.
   */

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
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

    // Calculate total points (sum of all rating points)
    const totalPoints = updatedRatings.reduce(
      (sum, rating) => sum + rating.points,
      0,
    );

    setRatings(updatedRatings);
    setMaxPoints(totalPoints);

    // Update criterion with both new ratings and total points
    const updatedCriterion = {
      ...criterion,
      ratings: updatedRatings,
      pointsPossible: totalPoints,
    };
    handleCriteriaUpdate(index, updatedCriterion);
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
        <RatingCard
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

    const updatedRatings = ratings.slice(0);
    updatedRatings.push(createRating(ratings.length));
    setRatings(updatedRatings);
    criterion.ratings = ratings;
    handleCriteriaUpdate(index, criterion);
  };

  const handleExpandCriterion = () => {
    setActiveCriterionIndex(index);
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
        className={`hover:bg-gray-500 hover:cursor-pointer h-24 max-h-36 flex gap-2 justify-between items-center border border-gray-700 shadow-xl p-6 rounded-lg w-full bg-gray-700`}
        onDoubleClick={handleExpandCriterion}
      >
        <div className={"flex justify-between w-full items-center gap-4"}>
          <div
            className="text-gray-300 w-3/5 line-clamp-3"
            title={criteriaDescription} // show full text on hover
          >
            {criteriaDescription}
          </div>
          <div className={"flex gap-3 items-center"}>
            <PaletteActionButton
              onPointerDown={(event: ReactMouseEvent) =>
                handleRemoveCriteriaButton(event, index)
              }
              color={"RED"}
              title={"Remove"}
            />
            <PaletteActionButton
              onPointerDown={handleExpandCriterion}
              color={"BLUE"}
              title={"Edit"}
            />
            <div className={"grid text-center"}>
              <p>Max Points</p>
              <p>{maxPoints}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const toggleGroupCriteriaFlag = (
    event: ReactMouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    setGroupCriteria((prevState) => !prevState);
    handleCriteriaUpdate(index, criterion);
  };

  const renderDetailedView = () => {
    return (
      <div
        className={
          " flex flex-col gap-4 shadow-xl p-6 rounded-lg w-full bg-gray-700 "
        }
        onDoubleClick={(event) => {
          // check if the clicked target is the card itself to avoid messing with child elements
          if (event.target === event.currentTarget) {
            setActiveCriterionIndex(-1);
          }
        }}
      >
        {/* Card style and main grid layout for content*/}

        <textarea
          placeholder={`Criteria ${index + 1} Description...`}
          className={
            "rounded-lg p-3 text-gray-300 border border-gray-600 bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-800 mb-2"
          }
          value={criteriaDescription}
          onChange={handleDescriptionChange}
          rows={2}
        />

        <motion.div
          layout
          className={
            "my-2 mx-4 flex gap-4 max-h-64" +
            " overflow-y-auto justify-center" +
            " scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800 p-2"
          }
        >
          {renderRatingOptions()}
        </motion.div>

        <div className={`flex gap-2 items-center justify-center`}>
          <PaletteActionButton
            color={"PURPLE"}
            onClick={(event) => handleAddRating(event, index)}
            title={"Add Rating"}
          />
          <PaletteActionButton
            color={"YELLOW"}
            onPointerDown={() => setActiveCriterionIndex(-1)}
            title={"Collapse Card"}
          />
          <PaletteActionButton
            color={"BLUE"}
            onClick={() => setTemplateSetterActive(true)}
            title={"Add Template"}
          />
          <PaletteActionButton
            color={"RED"}
            onPointerDown={(event: ReactMouseEvent<HTMLButtonElement>) =>
              handleRemoveCriteriaButton(event, index)
            }
            title={"Remove Criterion"}
          />

          <Dialog
            isOpen={templateSetterActive}
            onClose={() => setTemplateSetterActive(false)}
            title={
              "Add common criteria to a Template for faster building in the future!"
            }
          >
            <TemplateSetter
              closeTemplateCard={() => setTemplateSetterActive(false)}
              handleSetTemplateTitle={handleSetTemplateTitle}
              criterion={criterion}
            />
          </Dialog>
        </div>
        <div className={"flex justify-end gap-3 items-center"}>
          <p className="text-xl font-semibold  h-10 text-gray-200 bg-gray-500 px-3 py-1 rounded-lg">
            Max Points: {maxPoints}
          </p>

          <PaletteActionButton
            color={groupCriteria ? "BLUE" : "GRAY"}
            title={groupCriteria ? "Group Criteria" : "Individual Criteria"}
            onClick={(event: ReactMouseEvent<HTMLButtonElement>) =>
              toggleGroupCriteriaFlag(event)
            }
          />
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
