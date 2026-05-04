export const SCORE_AXES = ["sound", "lyrics", "artwork"] as const;
export type ScoreAxis = (typeof SCORE_AXES)[number];

export const DEFAULT_SCORE = 5;
