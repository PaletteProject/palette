import { Template, Criteria } from "palette-types";
import { v4 as uuid } from "uuid";

export function createTemplate(
  title: string = "",
  criteria: Criteria[] = [],
  id?: number,
): Template {
  return {
    title,
    criteria: criteria,
    id,
    key: uuid(),
  };
}
