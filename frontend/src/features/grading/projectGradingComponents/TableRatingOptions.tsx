import { Criteria } from "palette-types";
import { useRubric } from "@/context";

interface TableRatingOptionsProps {
  criterion: Criteria;
}

export function TableRatingOptions({ criterion }: TableRatingOptionsProps) {
  const { activeRubric, setActiveRubric } = useRubric();

  const isGroupSelected =
    activeRubric.criteria.find((c) => c.id === criterion.id)
      ?.isGroupCriterion ?? false;

  const handleToggle = () => {
    if (!activeRubric) return;

    const index = activeRubric.criteria.indexOf(criterion);
    const newCriteria = [...activeRubric.criteria];
    newCriteria[index] = {
      ...criterion,
      isGroupCriterion: !criterion.isGroupCriterion,
    };
    setActiveRubric({ ...activeRubric, criteria: newCriteria });
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
