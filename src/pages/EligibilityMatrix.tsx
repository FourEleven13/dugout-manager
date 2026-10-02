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

type Props = {
  roster: Player[];
};

export function EligibilityMatrix({ roster }: Props) {
  const { eligibility, recalcEligibility } = useLineupStore();

  // ⭐ Prevent crash if roster is undefined
  const safeRoster = Array.isArray(roster) ? roster : [];

  useEffect(() => {
    recalcEligibility(safeRoster);
  }, [safeRoster, recalcEligibility]);

  return (
    <div
      style={{
        padding: "1rem",
        background: "#020617",
        color: "#e5e7eb",
        minHeight: "100vh"
      }}
    >
      <h2>Eligibility Matrix</h2>

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
              {positions.map((pos) => (
                <th key={pos} style={thStyle}>{pos}</th>
              ))}
              <th style={thStyle}>Total</th>
            </tr>
          </thead>

          <tbody>
            {safeRoster.map((player) => {
              const e = eligibility[player.name] || {
                eligible: {
                  P: false,
                  C: false,
                  "1B": false,
                  "2B": false,
                  SS: false,
                  "3B": false,
                  LF: false,
                  CF: false,
                  RF: false
                },
                total: 0
              };

              return (
                <tr key={player.id}>
                  <td style={tdHeaderStyle}>{player.name}</td>

                  {positions.map((pos) => (
                    <td key={pos} style={tdStyle}>
                      {e.eligible[pos] ? "✔" : ""}
                    </td>
                  ))}

                  <td style={tdStyle}>{e.total}</td>
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
