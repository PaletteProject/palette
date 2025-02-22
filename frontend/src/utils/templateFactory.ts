import { Template, Criteria, Tag } from "palette-types";
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
    0
  ),
  quickStart: boolean = false,
  saved: boolean | null = null
): Template {
  return {
    title,
    criteria: criteria,
    id,
    key: uuid(),
    description,
    createdAt,
    lastUsed: "Never",
    usageCount,
    tags,
    points,
    quickStart,
    saved: saved || false,
  };
}
