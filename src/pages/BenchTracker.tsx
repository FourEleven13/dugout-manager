import React, { useEffect } from "react";
import { Player } from "../teams/TeamContext";
import { useLineupStore } from "../store/LineupStore";

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

const positions: Position[] = [
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

const innings = [1, 2, 3, 4, 5, 6];

type Props = {
  roster: Player[];
};

export function BenchTracker({ roster }: Props) {
  const { assignments, benchTotals, recalcBenchTotals } = useLineupStore();

  // ⭐ Prevent crash if roster is undefined
  const safeRoster = Array.isArray(roster) ? roster : [];

  useEffect(() => {
    recalcBenchTotals(safeRoster);
  }, [assignments, safeRoster, recalcBenchTotals]);

  return (
    <div
      style={{
        padding: "1rem",
        background: "#020617",
        color: "#e5e7eb",
        minHeight: "100vh"
      }}
    >
      <h2>Playing Time & Bench Tracker</h2>

      <div style={{ overflowX: "auto", marginTop: "1rem" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#0b1f33"
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Player</th>
              <th style={thStyle}>Played</th>
              <th style={thStyle}>Benched</th>
              {positions.map((pos) => (
                <th key={pos} style={thStyle}>{pos}</th>
              ))}
              <th style={thStyle}>Total Positions</th>
            </tr>
          </thead>

          <tbody>
            {safeRoster.map((player) => {
              const t = benchTotals[player.name] || {
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

              const totalPositions = positions.reduce(
                (sum, pos) => sum + t.positions[pos],
                0
              );

              return (
                <tr key={player.id}>
                  <td style={tdHeaderStyle}>{player.name}</td>
                  <td style={tdStyle}>{t.played}</td>
                  <td style={tdStyle}>{t.benched}</td>

                  {positions.map((pos) => (
                    <td key={pos} style={tdStyle}>
                      {t.positions[pos]}
                    </td>
                  ))}

                  <td style={tdStyle}>{totalPositions}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
