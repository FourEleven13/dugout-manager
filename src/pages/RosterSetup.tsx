import React from "react";
import { useTeam } from "../teams/TeamContext";
import { RosterUpload } from "../components/RosterUpload";
import { RosterMatrix } from "../components/RosterMatrix";
import "../styles/dugout-dashboard.css";

export function RosterSetup() {
  const { team, saveRoster } = useTeam();

  if (!team) {
    return <p style={{ padding: "1rem", color: "#e5e7eb" }}>Loading team…</p>;
  }

    return (
    <div
      style={{
        padding: "1rem",
        background: "#f4f6f8",
        color: "#212121",
        minHeight: "calc(100vh - 52px)"
      }}
    >
      <h2 style={{ marginTop: 0 }}>Roster & eligibility</h2>
      <p style={{ color: "#666", maxWidth: 640 }}>
        Mirror your spreadsheet <strong>Roster</strong> tab: player names plus which
        positions they can play. Upload CSV or add players manually.
      </p>

      <div style={{ display: "grid", gap: "1rem", maxWidth: 900 }}>
        <RosterUpload onUpload={(players) => saveRoster(players)} />
        <RosterMatrix
          roster={team.roster}
          onChange={(nextRoster) => saveRoster(nextRoster)}
        />
      </div>
    </div>
  );
}
