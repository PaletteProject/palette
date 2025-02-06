import { Tag } from "palette-types";
import { v4 as uuid } from "uuid";

export const createTag = (
  name: string = "",
  color: string = "#9CA3AF",
  description: string = "",
  createdAt: Date = new Date(),
  lastUsed: Date | string = "Never",
  usageCount: number = 0,
): Tag => {
  return {
    key: uuid(),
    name: name,
    color: color,
    description: description,
    createdAt: createdAt,
    lastUsed: typeof lastUsed === "string" ? new Date(lastUsed) : lastUsed,
    usageCount: usageCount,
  };
};
