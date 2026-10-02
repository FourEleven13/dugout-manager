export const FIELD_POSITIONS = [
  "P",
  "C",
  "1B",
  "2B",
  "3B",
  "SS",
  "LF",
  "CF",
  "RF"
] as const;

export type FieldPosition = (typeof FIELD_POSITIONS)[number];

export const BENCH_KEY = "Bench";
export const TOTAL_INNINGS = 6;

export const POSITION_PRIORITY: FieldPosition[] = [
  "C",
  "P",
  "SS",
  "1B",
  "3B",
  "2B",
  "CF",
  "LF",
  "RF"
];
