import { BENCH_KEY, FIELD_POSITIONS, FieldPosition, TOTAL_INNINGS } from "./lineupConstants";
import { Player } from "../teams/TeamContext";
import { PlayerLineups } from "./lineupEngine";

export type LineupWarningSeverity = "error" | "warning";

export type LineupWarning = {
  severity: LineupWarningSeverity;
  title: string;
  detail: string;
};

export type LineupValidation = {
  canGenerate: boolean;
  warnings: LineupWarning[];
  conflicts: Array<{
    inning: number;
    player: string;
    positions: FieldPosition[];
  }>;
  missingPositions: Array<{
    inning: number;
    positions: FieldPosition[];
  }>;
  playersWithoutPositions: string[];
};

export function validateRoster(roster: Player[]): LineupValidation {
  const warnings: LineupWarning[] = [];
  const playersWithoutPositions = roster
    .filter((player) => !player.positions.some((pos) => FIELD_POSITIONS.includes(pos as FieldPosition)))
    .map((player) => player.name);

  if (roster.length < 9) {
    const missing = 9 - roster.length;
    warnings.push({
      severity: "error",
      title: "Not enough players",
      detail: `${roster.length} available. You need ${missing} more player${missing === 1 ? "" : "s"} for a complete 9-player defensive lineup.`
    });
  }

  if (playersWithoutPositions.length) {
    warnings.push({
      severity: "error",
      title: "Players need positions",
      detail: `${playersWithoutPositions.join(", ")} ${playersWithoutPositions.length === 1 ? "has" : "have"} no eligible positions selected.`
    });
  }

  return {
    canGenerate: roster.length >= 9 && playersWithoutPositions.length === 0,
    warnings,
    conflicts: [],
    missingPositions: [],
    playersWithoutPositions
  };
}

export function validateLineup(roster: Player[], lineups: PlayerLineups): LineupValidation {
  const base = validateRoster(roster);
  const warnings = [...base.warnings];
  const conflicts: LineupValidation["conflicts"] = [];
  const missingPositions: LineupValidation["missingPositions"] = [];

  for (let inningIndex = 0; inningIndex < TOTAL_INNINGS; inningIndex++) {
    const positionOwners = new Map<FieldPosition, string>();
    const positionPlayers = new Map<FieldPosition, string[]>();
    const playerPositions = new Map<string, FieldPosition[]>();

    roster.forEach((player) => {
      const assigned = lineups[player.name]?.[inningIndex] ?? BENCH_KEY;
      if (!FIELD_POSITIONS.includes(assigned as FieldPosition)) return;

      const position = assigned as FieldPosition;
      positionOwners.set(position, player.name);
      const playersAtPosition = positionPlayers.get(position) ?? [];
      playersAtPosition.push(player.name);
      positionPlayers.set(position, playersAtPosition);
      const positions = playerPositions.get(player.name) ?? [];
      positions.push(position);
      playerPositions.set(player.name, positions);

      if (!player.positions.includes(position)) {
        warnings.push({
          severity: "warning",
          title: "Position eligibility",
          detail: `${player.name} is assigned to ${position} in Inning ${inningIndex + 1}, but ${position} is not selected as an eligible position.`
        });
      }
    });

    positionPlayers.forEach((players, position) => {
      if (players.length > 1) {
        warnings.push({
          severity: "warning",
          title: "Position has multiple players",
          detail: `${position} has ${players.join(" + ")} assigned in Inning ${inningIndex + 1}.`
        });
      }
    });

    playerPositions.forEach((positions, player) => {
      if (positions.length > 1) {
        conflicts.push({ inning: inningIndex + 1, player, positions });
        warnings.push({
          severity: "warning",
          title: "Position conflict",
          detail: `${player} is assigned to ${positions.join(" + ")} in Inning ${inningIndex + 1}.`
        });
      }
    });

    const missing = FIELD_POSITIONS.filter((position) => !positionOwners.has(position));
    if (missing.length) {
      missingPositions.push({ inning: inningIndex + 1, positions: missing });
      warnings.push({
        severity: "warning",
        title: `Inning ${inningIndex + 1} has open positions`,
        detail: `Missing: ${missing.join(", ")}.`
      });
    }
  }

  const playingTime = roster.map((player) => {
    const played = (lineups[player.name] ?? []).filter((value) => FIELD_POSITIONS.includes(value as FieldPosition)).length;
    return { name: player.name, played, benched: TOTAL_INNINGS - played };
  });

  if (playingTime.length > 1) {
    const maxPlayed = Math.max(...playingTime.map((p) => p.played));
    const minPlayed = Math.min(...playingTime.map((p) => p.played));
    if (maxPlayed - minPlayed >= 3) {
      const high = playingTime.filter((p) => p.played === maxPlayed).map((p) => p.name).join(", ");
      const low = playingTime.filter((p) => p.played === minPlayed).map((p) => p.name).join(", ");
      warnings.push({
        severity: "warning",
        title: "Playing time review",
        detail: `${high} have ${maxPlayed} innings while ${low} have ${minPlayed}. Review the balance.`
      });
    }
  }

  return {
    canGenerate: base.canGenerate,
    warnings,
    conflicts,
    missingPositions,
    playersWithoutPositions: base.playersWithoutPositions
  };
}
