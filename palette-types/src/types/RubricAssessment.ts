export interface RubricAssessment {
  [criterion_id: string]: {
    rating_id: string;
    comments: string;
    points: number;
  };
}
