import { Template, Criteria } from "palette-types";
import { Tag } from "palette-types/src/types/Tag";
import { v4 as uuid } from "uuid";

export function createTemplate(
  title: string = "",
  criteria: Criteria[] = [],
  id?: number,
  description: string = "",
  createdAt: Date = new Date(),
  lastUsed: Date | string = "Never",
  usageCount: number = 0,
  tags: Tag[] = [],
  points: number = criteria.reduce(
    (acc, criterion) => acc + criterion.pointsPossible,
    0,
  ),
): Template {
  return {
    title,
    criteria: criteria,
    id,
    key: uuid(),
    description,
    createdAt,
    lastUsed: typeof lastUsed === "string" ? new Date(lastUsed) : lastUsed,
    usageCount,
    tags,
    points,
  };
}
