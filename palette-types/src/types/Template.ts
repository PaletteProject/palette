import { Criteria } from "./Criteria";
import { Tag } from "./Tag";

export interface Template {
  id?: number; // OPTIONAL: new rubrics will not have one assigned by Canvas
  title: string;
  key: string; // unique key for React DOM (with uuid)
  criteria: Criteria[];
  description: string;
  createdAt: Date;
  lastUsed: Date | string;
  usageCount: number;
  tags: Tag[];
  points: number;
  quickStart: boolean;
}
