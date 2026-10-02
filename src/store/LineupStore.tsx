import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { useAuth } from "../auth/AuthContext";
import { useCoachData } from "../context/CoachDataContext";
import { Player } from "../teams/TeamContext";
import {
  autoGenerateLineup,
  ensurePlayerLineups,
  lineupsToAssignments,
  PlayerLineups
} from "../lib/lineupEngine";

type Position =
  | "P"
  | "C"
  | "1B"
  | "2B"
  | "SS"
  | "3B"
  | "LF"
  | "CF"
  | "RF";

type InningAssignments = {
  [pos in Position]: string;
};

type AllAssignments = {
  [inning: number]: InningAssignments;
};

type BenchTotals = {
  [playerName: string]: {
    played: number;
    benched: number;
    positions: Record<Position, number>;
  };
};

type EligibilityTotals = {
  [playerName: string]: {
    eligible: Record<Position, boolean>;
    total: number;
  };
};

type LineupStoreValue = {
  assignments: AllAssignments;
  setAssignments: (a: AllAssignments) => void;

  playerLineups: PlayerLineups;
  setPlayerLineups: React.Dispatch<React.SetStateAction<PlayerLineups>>;
  syncFromPlayerLineups: (roster: Player[]) => void;
  saveLineups: (roster: Player[]) => Promise<void>;
  applyAutoGenerate: (roster: Player[]) => Promise<void>;

  battingOrder: string[];
  setBattingOrder: (order: string[]) => void;

  benchTotals: BenchTotals;
  eligibility: EligibilityTotals;

  recalcBenchTotals: (roster: Player[]) => void;
  recalcEligibility: (roster: Player[]) => void;
};

const LineupStore = createContext<LineupStoreValue | undefined>(undefined);

const POSITIONS: Position[] = [
  "P",
  "C",
  "1B",
  "2B",
  "SS",
  "3B",
  "LF",
  "CF",
  "RF"
];

const INNINGS = [1, 2, 3, 4, 5, 6];

function emptyInning(): InningAssignments {
  const base: Partial<InningAssignments> = {};
  POSITIONS.forEach((pos) => (base[pos] = "—"));
  return base as InningAssignments;
}

function normalizeAssignments(
  raw: Record<number, Record<string, string>> | undefined
): AllAssignments {
  const result: Partial<AllAssignments> = {};
  INNINGS.forEach((inn) => {
    const row = raw?.[inn];
    const base = emptyInning();
    if (row) {
      POSITIONS.forEach((pos) => {
        if (row[pos]) base[pos] = row[pos];
      });
    }
    result[inn] = base;
  });
  return result as AllAssignments;
}

export const LineupStoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { user } = useAuth();
  const { payload, updatePayload, loading: coachLoading } = useCoachData();
  const hydratedForUser = useRef<string | null>(null);

  const [assignments, setAssignments] = useState<AllAssignments>(() => {
    const initial: Partial<AllAssignments> = {};
    INNINGS.forEach((inn) => (initial[inn] = emptyInning()));
    return initial as AllAssignments;
  });

  const [playerLineups, setPlayerLineups] = useState<PlayerLineups>({});
  const [battingOrder, setBattingOrderState] = useState<string[]>([]);
  const [benchTotals, setBenchTotals] = useState<BenchTotals>({});
  const [eligibility, setEligibility] = useState<EligibilityTotals>({});

  useEffect(() => {
    hydratedForUser.current = null;
  }, [user?.id]);

  useEffect(() => {
    if (coachLoading || !user) return;
    if (hydratedForUser.current === user.id) return;
    hydratedForUser.current = user.id;

    setPlayerLineups(payload.playerLineups ?? {});
    setAssignments(normalizeAssignments(payload.assignments));
    setBattingOrderState(payload.battingOrder ?? []);
  }, [coachLoading, user?.id, payload]);

  const recalcBenchTotalsInternal = (
    assignmentGrid: AllAssignments,
    roster: Player[]
  ) => {
    const totals: BenchTotals = {};

    roster.forEach((p) => {
      totals[p.name] = {
        played: 0,
        benched: 0,
        positions: {
          P: 0,
          C: 0,
          "1B": 0,
          "2B": 0,
          SS: 0,
          "3B": 0,
          LF: 0,
          CF: 0,
          RF: 0
        }
      };
    });

    INNINGS.forEach((inn) => {
      const inningData = assignmentGrid[inn];

      roster.forEach((player) => {
        const playedThisInning = POSITIONS.some(
          (pos) => inningData[pos] === player.name
        );

        if (playedThisInning) {
          totals[player.name].played += 1;
          POSITIONS.forEach((pos) => {
            if (inningData[pos] === player.name) {
              totals[player.name].positions[pos] += 1;
            }
          });
        } else {
          totals[player.name].benched += 1;
        }
      });
    });

    setBenchTotals(totals);
  };

  const recalcBenchTotals = (roster: Player[]) => {
    recalcBenchTotalsInternal(assignments, roster);
  };

  const recalcEligibility = (roster: Player[]) => {
    const totals: EligibilityTotals = {};

    roster.forEach((p) => {
      const eligible: Record<Position, boolean> = {
        P: p.positions.includes("P"),
        C: p.positions.includes("C"),
        "1B": p.positions.includes("1B"),
        "2B": p.positions.includes("2B"),
        SS: p.positions.includes("SS"),
        "3B": p.positions.includes("3B"),
        LF: p.positions.includes("LF"),
        CF: p.positions.includes("CF"),
        RF: p.positions.includes("RF")
      };
      totals[p.name] = {
        eligible,
        total: Object.values(eligible).filter(Boolean).length
      };
    });

    setEligibility(totals);
  };

  const persistLineups = useCallback(
    async (lineups: PlayerLineups, roster: Player[]) => {
      const nextAssignments = lineupsToAssignments(lineups);
      setAssignments(nextAssignments);
      setPlayerLineups(lineups);
      recalcBenchTotalsInternal(nextAssignments, roster);
      recalcEligibility(roster);
      await updatePayload({
        playerLineups: lineups,
        assignments: nextAssignments
      });
    },
    [updatePayload]
  );

  const syncFromPlayerLineups = useCallback((roster: Player[]) => {
    setPlayerLineups((prev) => {
      const merged = ensurePlayerLineups(prev, roster);
      const nextAssignments = lineupsToAssignments(merged);
      setAssignments(nextAssignments);
      return merged;
    });
  }, []);

  const saveLineups = useCallback(
    async (roster: Player[]) => {
      await persistLineups(playerLineups, roster);
    },
    [persistLineups, playerLineups]
  );

  const applyAutoGenerate = useCallback(
    async (roster: Player[]) => {
      const generated = autoGenerateLineup(roster);
      await persistLineups(generated, roster);
    },
    [persistLineups]
  );

  const setBattingOrder = useCallback(
    (order: string[]) => {
      setBattingOrderState(order);
      void updatePayload({ battingOrder: order });
    },
    [updatePayload]
  );

  return (
    <LineupStore.Provider
      value={{
        assignments,
        setAssignments,
        playerLineups,
        setPlayerLineups,
        syncFromPlayerLineups,
        saveLineups,
        applyAutoGenerate,
        battingOrder,
        setBattingOrder,
        benchTotals,
        eligibility,
        recalcBenchTotals,
        recalcEligibility
      }}
    >
      {children}
    </LineupStore.Provider>
  );
};

export const useLineupStore = () => {
  const ctx = useContext(LineupStore);
  if (!ctx) {
    throw new Error("useLineupStore must be used within LineupStoreProvider");
  }
  return ctx;
};
