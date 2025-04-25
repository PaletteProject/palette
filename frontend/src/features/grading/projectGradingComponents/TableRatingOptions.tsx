import { useState, useEffect } from "react";
import { Criteria } from "palette-types";
import { useRubric } from "@context";

interface TableRatingOptionsProps {
  criterion: Criteria;
}

export function TableRatingOptions({ criterion }: TableRatingOptionsProps) {
  const { activeRubric, setActiveRubric } = useRubric();
  const storageKey = `criterion-${criterion.id}-isGroupCriterion`;

  const [isGroupSelected, setIsGroupSelected] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored !== null
        ? (JSON.parse(stored) as boolean)
        : (criterion.isGroupCriterion ?? false);
    } catch (error) {
      console.error(`Error reading localStorage key "${storageKey}":`, error);
      return criterion.isGroupCriterion ?? false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(isGroupSelected));
    } catch (error) {
      console.error(`Error setting localStorage key "${storageKey}":`, error);
    }
  }, [isGroupSelected, storageKey]);

  const handleToggle = () => {
    if (!activeRubric) return;

    const updatedCriteria = activeRubric.criteria.map((c) =>
      c.id === criterion.id ? { ...c, isGroupCriterion: !isGroupSelected } : c,
    );

    setActiveRubric({ ...activeRubric, criteria: updatedCriteria });
    setIsGroupSelected(!isGroupSelected);
  };

  return (
    <label className="flex gap-2 text-sm font-medium whitespace-nowrap items-center">
      <p>Apply Ratings to Group</p>
      <input
        type="checkbox"
        name={`${criterion.id}-checkbox`}
        id={`${criterion.id}-checkbox`}
        checked={isGroupSelected}
        onChange={handleToggle}
      />
    </label>
  );
}
