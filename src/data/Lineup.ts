export type InningAssignment = { inning: number; position: string };

export type LineupEntry = {
  order: number;
  name: string;
  battingHand: "Left" | "Right" | "Switch";
  assignments: InningAssignment[];
};

export const lineup: LineupEntry[] = [
  {
    order: 1,
    name: "Keagen",
    battingHand: "Right",
    assignments: [
      { inning: 1, position: "P" },
      { inning: 2, position: "P" },
      { inning: 3, position: "SS" },
      { inning: 4, position: "BN" },
      { inning: 5, position: "BN" },
      { inning: 6, position: "2B" }
    ]
  },
  {
    order: 2,
    name: "Hunter",
    battingHand: "Right",
    assignments: [
      { inning: 1, position: "C" },
      { inning: 2, position: "C" },
      { inning: 3, position: "CF" },
      { inning: 4, position: "CF" },
      { inning: 5, position: "BN" },
      { inning: 6, position: "1B" }
    ]
  },
  {
    order: 3,
    name: "Layne",
    battingHand: "Left",
    assignments: [
      { inning: 1, position: "SS" },
      { inning: 2, position: "SS" },
      { inning: 3, position: "2B" },
      { inning: 4, position: "SS" },
      { inning: 5, position: "3B" },
      { inning: 6, position: "BN" }
    ]
  },
  {
    order: 4,
    name: "Wyatt",
    battingHand: "Right",
    assignments: [
      { inning: 1, position: "CF" },
      { inning: 2, position: "CF" },
      { inning: 3, position: "P" },
      { inning: 4, position: "P" },
      { inning: 5, position: "SS" },
      { inning: 6, position: "SS" }
    ]
  },
  {
    order: 5,
    name: "Grey",
    battingHand: "Switch",
    assignments: [
      { inning: 1, position: "3B" },
      { inning: 2, position: "3B" },
      { inning: 3, position: "C" },
      { inning: 4, position: "C" },
      { inning: 5, position: "P" },
      { inning: 6, position: "P" }
    ]
  },
  {
    order: 6,
    name: "Ryan",
    battingHand: "Right",
    assignments: [
      { inning: 1, position: "1B" },
      { inning: 2, position: "1B" },
      { inning: 3, position: "1B" },
      { inning: 4, position: "BN" },
      { inning: 5, position: "C" },
      { inning: 6, position: "C" }
    ]
  },
  {
    order: 7,
    name: "Charles",
    battingHand: "Right",
    assignments: [
      { inning: 1, position: "LF" },
      { inning: 2, position: "LF" },
      { inning: 3, position: "BN" },
      { inning: 4, position: "1B" },
      { inning: 5, position: "1B" },
      { inning: 6, position: "BN" }
    ]
  },
  {
    order: 8,
    name: "Corey",
    battingHand: "Right",
    assignments: [
      { inning: 1, position: "RF" },
      { inning: 2, position: "BN" },
      { inning: 3, position: "BN" },
      { inning: 4, position: "LF" },
      { inning: 5, position: "LF" },
      { inning: 6, position: "3B" }
    ]
  },
  {
    order: 9,
    name: "Cruz",
    battingHand: "Right",
    assignments: [
      { inning: 1, position: "2B" },
      { inning: 2, position: "2B" },
      { inning: 3, position: "BN" },
      { inning: 4, position: "BN" },
      { inning: 5, position: "2B" },
      { inning: 6, position: "BN" }
    ]
  },
  {
    order: 10,
    name: "Travis",
    battingHand: "Left",
    assignments: [
      { inning: 1, position: "BN" },
      { inning: 2, position: "RF" },
      { inning: 3, position: "RF" },
      { inning: 4, position: "RF" },
      { inning: 5, position: "CF" },
      { inning: 6, position: "CF" }
    ]
  },
  {
    order: 11,
    name: "Gage",
    battingHand: "Right",
    assignments: [
      { inning: 1, position: "BN" },
      { inning: 2, position: "BN" },
      { inning: 3, position: "3B" },
      { inning: 4, position: "3B" },
      { inning: 5, position: "RF" },
      { inning: 6, position: "RF" }
    ]
  },
  {
    order: 12,
    name: "Ethan",
    battingHand: "Right",
    assignments: [
      { inning: 1, position: "BN" },
      { inning: 2, position: "BN" },
      { inning: 3, position: "LF" },
      { inning: 4, position: "2B" },
      { inning: 5, position: "BN" },
      { inning: 6, position: "LF" }
    ]
  }
];
