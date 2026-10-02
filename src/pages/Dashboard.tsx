import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useTeam } from "../teams/TeamContext";

import { RosterUpload } from "../components/RosterUpload";
import { RosterMatrix } from "../components/RosterMatrix";
import { ManualRosterEntry } from "../components/ManualRosterEntry";
import { GameLineup } from "../components/GameLineup";
import { DashboardTotals } from "../components/DashboardTotals";
import { PrintView } from "../components/PrintView";

export function Dashboard() {
  const { user, logout } = useAuth();
  const { team, setTeamName, saveRoster } = useTeam();

  const [screen, setScreen] = useState<"roster" | "lineup" | "dashboard" | "print">("roster");

  if (!team) return <p>Loading team...</p>;

  const hasRoster = team.roster && team.roster.length > 0;

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>{team.name}</h2>
          <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
            Logged in as {user?.email}
          </p>
        </div>

        <button
          onClick={logout}
          style={{
            padding: "0.25rem 0.75rem",
            background: "#ef4444",
            border: "none",
            borderRadius: "0.25rem",
            cursor: "pointer"
          }}
        >
          Log out
        </button>
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", gap: "0.75rem" }}>
        {["roster", "lineup", "dashboard", "print"].map((tab) => (
          <button
            key={tab}
            onClick={() => setScreen(tab as any)}
            style={{
              padding: "0.5rem 1rem",
              background: screen === tab ? "#1f7a53" : "#1e293b",
              border: "none",
              borderRadius: "0.25rem",
              cursor: "pointer",
              color: "#e5e7eb"
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Screens */}
      {screen === "roster" && (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {!hasRoster && (
            <RosterUpload onUpload={(players) => saveRoster(players)} />
          )}

          <ManualRosterEntry
            onAdd={(player) => {
              const updated = [...team.roster, player];
              saveRoster(updated);
            }}
          />

          {hasRoster && <RosterMatrix roster={team.roster} />}
        </div>
      )}

      {screen === "lineup" && (
        <div>
          {hasRoster ? (
            <GameLineup roster={team.roster} />
          ) : (
            <p style={{ color: "#9ca3af" }}>Add players to your roster first.</p>
          )}
        </div>
      )}

      {screen === "dashboard" && (
        <DashboardTotals roster={team.roster} />
      )}

      {screen === "print" && (
        <PrintView roster={team.roster} />
      )}
    </div>
  );
}
