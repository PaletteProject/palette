import { UNASSIGNED } from "./constants.ts";
import { Template, Criteria } from "../../../palette-types/src/types";
import { v4 as uuid } from "uuid";

export function createTemplate(
  title: string = "",
  criteria: Criteria[] = [],
  id: number = UNASSIGNED
): Template {
  return {
    title,
    criteria: criteria,
    id,
    key: uuid(),
  };
}