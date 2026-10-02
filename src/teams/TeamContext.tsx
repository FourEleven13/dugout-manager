import { useCoachData } from "../context/CoachDataContext";

export type Player = {
  id: string;
  name: string;
  number: string;
  positions: string[];
};

export type Team = {
  id: string;
  name: string;
  roster: Player[];
  drills?: unknown[];
};

/** @deprecated Use CoachDataProvider + useCoachData in app shell */
export const TeamProvider = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

export function useTeam() {
  const { team, roster, setTeamName, saveRoster } = useCoachData();
  return { team, roster, setTeamName, saveRoster };
}
