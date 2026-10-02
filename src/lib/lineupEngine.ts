import { Player } from "../teams/TeamContext";
import {
  BENCH_KEY,
  FIELD_POSITIONS,
  FieldPosition,
  POSITION_PRIORITY,
  TOTAL_INNINGS
} from "./lineupConstants";

export type PlayerLineups = Record<string, string[]>;

export function emptyPlayerLineups(roster: Player[]): PlayerLineups {
  const map: PlayerLineups = {};
  roster.forEach((p) => {
    map[p.name] = new Array(TOTAL_INNINGS).fill(BENCH_KEY);
  });
  return map;
}

export function ensurePlayerLineups(
  lineups: PlayerLineups,
  roster: Player[]
): PlayerLineups {
  const next = { ...lineups };
  roster.forEach((p) => {
    if (!next[p.name]) {
      next[p.name] = new Array(TOTAL_INNINGS).fill(BENCH_KEY);
    } else if (next[p.name].length < TOTAL_INNINGS) {
      next[p.name] = [
        ...next[p.name],
        ...new Array(TOTAL_INNINGS - next[p.name].length).fill(BENCH_KEY)
      ];
    }
  });
  Object.keys(next).forEach((name) => {
    if (!roster.some((p) => p.name === name)) {
      delete next[name];
    }
  });
  return next;
}

/** Spreadsheet Auto_Lineup → position-centric grid used by print/bench views */
export function lineupsToAssignments(lineups: PlayerLineups): Record<
  number,
  Record<FieldPosition, string>
> {
  const assignments: Record<number, Record<FieldPosition, string>> = {};

  for (let inn = 1; inn <= TOTAL_INNINGS; inn++) {
    const inningRow = {} as Record<FieldPosition, string>;
    FIELD_POSITIONS.forEach((pos) => {
      inningRow[pos] = "—";
    });

    for (const playerName in lineups) {
      const slot = lineups[playerName][inn - 1] || BENCH_KEY;
      if (FIELD_POSITIONS.includes(slot as FieldPosition)) {
        inningRow[slot as FieldPosition] = playerName;
      }
    }

    assignments[inn] = inningRow;
  }

  return assignments;
}

export function autoGenerateLineup(roster: Player[]): PlayerLineups {
  if (roster.length < 9) {
    throw new Error(
      `You have ${roster.length} players. You need ${9 - roster.length} more player${roster.length === 8 ? "" : "s"} for a complete defensive lineup.`
    );
  }

  const playersWithoutPositions = roster.filter(
    (p) => !p.positions.some((pos) => FIELD_POSITIONS.includes(pos as FieldPosition))
  );
  if (playersWithoutPositions.length > 0) {
    throw new Error(
      `These players have no eligible positions selected: ${playersWithoutPositions
        .map((p) => p.name)
        .join(", ")}.`
    );
  }

  const players = roster.map((p) => ({
    name: p.name,
    eligible: p.positions.filter((pos): pos is FieldPosition =>
      FIELD_POSITIONS.includes(pos as FieldPosition)
    )
  }));

  const tracking: Record<
    string,
    {
      inningsPlayed: number;
      history: FieldPosition[];
    }
  > = {};

  players.forEach((p) => {
    tracking[p.name] = { inningsPlayed: 0, history: [] };
  });

  const generatedGrid = emptyPlayerLineups(roster);

  for (let inn = 0; inn < TOTAL_INNINGS; inn++) {
    const assignedThisInning = new Set<string>();

    for (const pos of POSITION_PRIORITY) {
      const candidates = players
        .filter(
          (p) =>
            !assignedThisInning.has(p.name) && p.eligible.includes(pos)
        )
        .sort((a, b) => {
          const statsA = tracking[a.name];
          const statsB = tracking[b.name];
          const repeatA = statsA.history.includes(pos) ? 1 : 0;
          const repeatB = statsB.history.includes(pos) ? 1 : 0;
          if (repeatA !== repeatB) return repeatA - repeatB;
          return statsA.inningsPlayed - statsB.inningsPlayed;
        });

      if (candidates.length > 0) {
        const selected = candidates[0];
        generatedGrid[selected.name][inn] = pos;
        assignedThisInning.add(selected.name);
        tracking[selected.name].inningsPlayed++;
        tracking[selected.name].history.push(pos);
      }
    }
  }

  return generatedGrid;
}

export function dashboardSummaryRow(
  playerName: string,
  innings: string[]
): (string | number)[] {
  const counts: Record<string, number> = {
    P: 0,
    C: 0,
    "1B": 0,
    "2B": 0,
    "3B": 0,
    SS: 0,
    LF: 0,
    CF: 0,
    RF: 0,
    Bench: 0
  };

  innings.forEach((pos) => {
    const key = pos || BENCH_KEY;
    if (counts[key] !== undefined) counts[key]++;
    else counts.Bench++;
  });

  return [
    playerName,
    counts.P,
    counts.C,
    counts["1B"],
    counts["2B"],
    counts["3B"],
    counts.SS,
    counts.LF,
    counts.CF,
    counts.RF,
    counts.Bench,
    TOTAL_INNINGS
  ];
}
