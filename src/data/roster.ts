export type Player = {
  name: string;
  positions: string[];
};

export const roster: Player[] = [
  { name: "Keagen", positions: ["P", "2B", "SS", "LF", "CF", "RF"] },
  { name: "Hunter", positions: ["P", "C", "1B", "2B", "SS", "3B", "LF", "CF", "RF"] },
  { name: "Layne", positions: ["P", "C", "1B", "2B", "SS", "3B", "LF", "CF", "RF"] },
  { name: "Charles", positions: ["P", "1B", "3B"] },
  { name: "Wyatt", positions: ["P", "C", "1B", "2B", "SS", "3B", "LF", "CF", "RF"] },
  { name: "Travis", positions: ["C", "2B", "LF", "CF", "RF"] },
  { name: "Ryan", positions: ["P", "C", "1B", "3B"] },
  { name: "Grey", positions: ["P", "C", "2B", "SS", "3B", "LF", "CF", "RF"] },
  { name: "Ethan", positions: ["2B", "LF", "CF", "RF"] },
  { name: "Cruz", positions: ["P", "2B", "SS", "LF", "CF", "RF"] },
  { name: "Gage", positions: ["1B", "3B", "LF", "CF", "RF"] },
  { name: "Corey", positions: ["P", "1B", "3B", "LF", "CF", "RF"] }
];
