/**
 * Renders the list of Criteria for the active rubric in the Rubric Builder.
 */
import { AnimatePresence, motion } from "framer-motion";
import CriteriaInput from "./CriteriaCard.tsx";
import { Criteria } from "palette-types";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useRubric } from "@/context";

type CriteriaListPropsType = {
  criteria: Criteria[];
  activeCriterionIndex: number;
  onUpdateCriteria: (index: number, criterion: Criteria) => void;
  onRemoveCriteria: (index: number, criterion: Criteria) => void;
  setActiveCriterionIndex: (index: number) => void;
};

export default function CriteriaList({
  criteria,
  activeCriterionIndex,
  onUpdateCriteria,
  onRemoveCriteria,
  setActiveCriterionIndex,
}: CriteriaListPropsType) {
  const { activeRubric, setActiveRubric } = useRubric();
  /**
   * Fires when a drag event ends, resorting the rubric criteria.
   * @param event - drag end event
   */
  const handleDragEnd = (event: DragEndEvent) => {
    if (!activeRubric) return;
    if (event.over) {
      const oldIndex = criteria.findIndex(
        (criterion) => criterion.key === event.active.id,
      );
      const newIndex = criteria.findIndex(
        (criterion) => criterion.key === event.over!.id, // assert not null for type safety
      );

      const updatedCriteria = [...criteria];
      const [movedCriterion] = updatedCriteria.splice(oldIndex, 1);
      updatedCriteria.splice(newIndex, 0, movedCriterion);

      setActiveRubric({ ...activeRubric, criteria: updatedCriteria });
    }
  };
  criteria.forEach((criterion) => {
    if (!criterion.key) throw new Error("Criterion missing key!");
  });
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext
        items={criteria.map((criterion) => criterion.key)}
        strategy={verticalListSortingStrategy}
      >
        <AnimatePresence>
          {criteria.map((criterion, index) => (
            <motion.div
              key={criterion.key}
              initial={{
                opacity: 0,
                y: 50,
              }} // Starting state (entry animation)
              animate={{
                opacity: 1,
                y: 0,
              }} // Animate to this state when in the DOM
              exit={{ opacity: 0, x: 50 }} // Ending state (exit animation)
              transition={{ duration: 0.3 }} // Controls the duration of the animations
              className="my-1"
            >
              <CriteriaInput
                index={index}
                activeCriterionIndex={activeCriterionIndex}
                criterion={criterion}
                handleCriteriaUpdate={onUpdateCriteria}
                removeCriterion={onRemoveCriteria}
                setActiveCriterionIndex={setActiveCriterionIndex}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </SortableContext>
    </DndContext>
  );
}
