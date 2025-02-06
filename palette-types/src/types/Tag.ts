export interface Tag {
  key: string;
  name: string;
  color: string;
  description: string;
  createdAt: Date;
  lastUsed: Date | null;
  usageCount: number;
}
