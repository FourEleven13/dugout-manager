import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { useAuth } from "../auth/AuthContext";
import {
  CoachPayload,
  emptyCoachPayload,
  loadCoachData,
  saveCoachData
} from "../lib/coachData";
import { Player, Team } from "../teams/TeamContext";

type CoachDataContextValue = {
  loading: boolean;
  syncError: string | null;
  team: Team | null;
  payload: CoachPayload;
  roster: Player[];
  setTeamName: (name: string) => void;
  saveRoster: (players: Player[]) => void;
  updatePayload: (patch: Partial<CoachPayload>) => Promise<void>;
};

const CoachDataContext = createContext<CoachDataContextValue | undefined>(
  undefined
);

export function CoachDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [payload, setPayload] = useState<CoachPayload>(emptyCoachPayload());

  useEffect(() => {
    if (!user) {
      setPayload(emptyCoachPayload());
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setSyncError(null);

    loadCoachData(user.id)
      .then((data) => {
        if (!cancelled) setPayload(data);
      })
      .catch((e) => {
        if (!cancelled) {
          setSyncError(e instanceof Error ? e.message : "Failed to load team data.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const persist = useCallback(
    async (next: CoachPayload) => {
      if (!user) return;
      setPayload(next);
      setSyncError(null);
      try {
        await saveCoachData(user.id, next);
      } catch (e) {
        setSyncError(e instanceof Error ? e.message : "Save failed.");
        throw e;
      }
    },
    [user]
  );

  const updatePayload = useCallback(
    async (patch: Partial<CoachPayload>) => {
      const next = { ...payload, ...patch };
      await persist(next);
    },
    [payload, persist]
  );

  const team: Team | null = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      name: payload.teamName,
      roster: payload.roster
    };
  }, [user, payload.teamName, payload.roster]);

  const setTeamName = (name: string) => {
    void updatePayload({ teamName: name });
  };

  const saveRoster = (players: Player[]) => {
    void updatePayload({ roster: players });
  };

  const value: CoachDataContextValue = {
    loading,
    syncError,
    team,
    payload,
    roster: payload.roster,
    setTeamName,
    saveRoster,
    updatePayload
  };

  return (
    <CoachDataContext.Provider value={value}>{children}</CoachDataContext.Provider>
  );
}

export function useCoachData() {
  const ctx = useContext(CoachDataContext);
  if (!ctx) {
    throw new Error("useCoachData must be used within CoachDataProvider");
  }
  return ctx;
}
