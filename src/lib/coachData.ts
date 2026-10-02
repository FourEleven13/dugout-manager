import { Player } from "../teams/TeamContext";
import { PlayerLineups } from "./lineupEngine";
import { isCloudEnabled, supabase } from "./supabase";

export type CoachPayload = {
  teamName: string;
  roster: Player[];
  playerLineups: PlayerLineups;
  assignments: Record<number, Record<string, string>>;
  battingOrder: string[];
};

export const emptyCoachPayload = (): CoachPayload => ({
  teamName: "My Team",
  roster: [],
  playerLineups: {},
  assignments: {},
  battingOrder: []
});

function localKey(userId: string) {
  return `dugout_coach_data_${userId}`;
}

export async function loadCoachData(userId: string): Promise<CoachPayload> {
  if (isCloudEnabled && supabase) {
    const { data, error } = await supabase
      .from("coach_teams")
      .select("team_name, roster, player_lineups, assignments, batting_order")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("loadCoachData", error);
      throw new Error("Could not load your team. Try again in a moment.");
    }

    if (!data) {
      return emptyCoachPayload();
    }

    return {
      teamName: data.team_name ?? "My Team",
      roster: (data.roster as Player[]) ?? [],
      playerLineups: (data.player_lineups as PlayerLineups) ?? {},
      assignments: (data.assignments as CoachPayload["assignments"]) ?? {},
      battingOrder: (data.batting_order as string[]) ?? []
    };
  }

  const stored = localStorage.getItem(localKey(userId));
  if (stored) {
    try {
      return { ...emptyCoachPayload(), ...JSON.parse(stored) };
    } catch {
      /* fall through */
    }
  }
  return emptyCoachPayload();
}

export async function saveCoachData(
  userId: string,
  payload: CoachPayload
): Promise<void> {
  if (isCloudEnabled && supabase) {
    const { error } = await supabase.from("coach_teams").upsert(
      {
        user_id: userId,
        team_name: payload.teamName,
        roster: payload.roster,
        player_lineups: payload.playerLineups,
        assignments: payload.assignments,
        batting_order: payload.battingOrder,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("saveCoachData", error);
      throw new Error("Could not save. Check your connection and try again.");
    }
    return;
  }

  localStorage.setItem(localKey(userId), JSON.stringify(payload));
}
