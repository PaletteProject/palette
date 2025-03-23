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
  return (
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
  );
}
