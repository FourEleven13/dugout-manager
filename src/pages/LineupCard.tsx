import React, { useState } from "react";
import { Player } from "../teams/TeamContext";
import { useLineupStore } from "../store/LineupStore";

type Props = {
  roster: Player[];
};

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

const positions: Position[] = ["P", "C", "1B", "2B", "SS", "3B", "LF", "CF", "RF"];
const innings = [1, 2, 3, 4, 5, 6];

// ⭐ Inning Selector Component
function InningSelector({ inning, setInning }) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
      {innings.map((i) => (
        <button
          key={i}
          onClick={() => setInning(i)}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            background: inning === i ? "#1f7a53" : "#1e293b",
            color: "#e5e7eb",
            border: "none",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          {i}
        </button>
      ))}
    </div>
  );
}

// ⭐ Position Dropdown Component
function PositionSelector({ position, players, value, onChange }) {
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: "0.5rem",
        borderRadius: "6px",
        background: "#1e293b",
        color: "#e5e7eb",
        border: "1px solid #334155",
        width: "100%"
      }}
    >
      <option value="">—</option>
      {players.map((p) => (
        <option key={p.id} value={p.name}>
          {p.name}
        </option>
      ))}
    </select>
  );
}

export function LineupCard({ roster }: Props) {
  const {
    assignments,
    setAssignments,
    recalcBenchTotals,
    recalcEligibility
  } = useLineupStore();

  const [inning, setInning] = useState(1);

  // ⭐ Prevent crash if roster is undefined
  if (!Array.isArray(roster)) {
    return (
      <div style={{ padding: "1rem", color: "#e5e7eb" }}>
        Loading roster…
      </div>
    );
  }

  // ⭐ Prevent crash before assignments initialize
  if (
    !assignments ||
    Object.keys(assignments).length === 0 ||
    innings.some((inn) => !assignments[inn])
  ) {
    return (
      <div style={{ padding: "1rem", color: "#e5e7eb" }}>
        Loading lineup…
      </div>
    );
  }

  const defensiveNine = assignments[inning];

  const updateCell = (inning: number, pos: Position, player: string) => {
    const updated = {
      ...assignments,
      [inning]: {
        ...assignments[inning],
        [pos]: player
      }
    };

    setAssignments(updated);
    recalcBenchTotals(roster);
    recalcEligibility(roster);
  };

  const autoFillInning = (inning: number) => {
    const updated = { ...assignments };
    const used = new Set<string>();

    positions.forEach((pos) => {
      const player =
        roster.find(
          (p) => p.positions.includes(pos) && !used.has(p.name)
        )?.name || "—";

      if (player !== "—") used.add(player);
      updated[inning][pos] = player;
    });

    setAssignments(updated);
    recalcBenchTotals(roster);
    recalcEligibility(roster);
  };

  const copyInningToAll = (sourceInning: number) => {
    const updated = { ...assignments };

    innings.forEach((inn) => {
      updated[inn] = { ...assignments[sourceInning] };
    });

    setAssignments(updated);
    recalcBenchTotals(roster);
    recalcEligibility(roster);
  };

  const printPage = () => window.print();

  return (
    <div
      style={{
        padding: "1rem",
        background: "#020617",
        color: "#e5e7eb",
        minHeight: "100vh"
      }}
    >
      <h2 style={{ marginBottom: "1rem" }}>6-Inning Lineup Card</h2>

      {/* ⭐ Inning Selector */}
      <InningSelector inning={inning} setInning={setInning} />

      {/* ⭐ Defensive Nine */}
      <div style={{ marginBottom: "1rem" }}>
        <h3>Defensive Nine — Inning {inning}</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {Object.entries(defensiveNine).map(([position, player]) => (
            <li key={position} style={{ marginBottom: "0.5rem" }}>
              <strong>{position}:</strong> {player || "—"}
            </li>
          ))}
        </ul>
      </div>

      {/* ⭐ Position Assignment Table */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#0b1f33"
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Position</th>
              <th style={thStyle}>Player</th>
            </tr>
          </thead>

          <tbody>
            {positions.map((pos) => (
              <tr key={pos}>
                <td style={tdHeaderStyle}>{pos}</td>
                <td style={tdStyle}>
                  <PositionSelector
                    position={pos}
                    players={roster}
                    value={defensiveNine[pos]}
                    onChange={(newPlayer) => updateCell(inning, pos, newPlayer)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ⭐ Buttons */}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <button style={btn} onClick={() => autoFillInning(inning)}>
          Auto-Fill This Inning
        </button>
        <button style={btn} onClick={() => copyInningToAll(inning)}>
          Copy This Inning → All
        </button>
        <button style={btn} onClick={printPage}>
          Print This Page
        </button>
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  padding: "0.5rem 1rem",
  background: "#1e293b",
  color: "#e5e7eb",
  border: "none",
  borderRadius: "0.25rem",
  cursor: "pointer",
  fontSize: "0.9rem"
};

const thStyle: React.CSSProperties = {
  padding: "0.5rem",
  borderBottom: "1px solid #1f2937",
  textAlign: "center",
  fontWeight: 600
};

const tdHeaderStyle: React.CSSProperties = {
  padding: "0.5rem",
  borderBottom: "1px solid #1f2937",
  textAlign: "center",
  fontWeight: 600,
  background: "#020617"
};

const tdStyle: React.CSSProperties = {
  padding: "0.5rem",
  borderBottom: "1px solid #1f2937",
  textAlign: "center"
};
