import React from "react";
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

export function PrintView({ roster }: Props) {
  const {
    assignments,
    battingOrder,
    benchTotals,
    eligibility
  } = useLineupStore();

  // ⭐ Prevent crash if roster is undefined
  const safeRoster = Array.isArray(roster) ? roster : [];

  const printPage = () => window.print();

  return (
    <div
      style={{
        padding: "1rem",
        background: "white",
        color: "black",
        minHeight: "100vh"
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1rem"
        }}
      >
        <h2>Printable 6-Inning Lineup Card</h2>
        <button
          onClick={printPage}
          style={{
            padding: "0.5rem 1rem",
            background: "#1f7a53",
            color: "white",
            border: "none",
            borderRadius: "0.25rem",
            cursor: "pointer"
          }}
        >
          Print
        </button>
      </div>

      {/* Defensive Grid */}
      <h3>Defensive Grid</h3>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Position</th>
            {innings.map((inn) => (
              <th key={inn} style={thStyle}>{inn}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => (
            <tr key={pos}>
              <td style={tdHeaderStyle}>{pos}</td>
              {innings.map((inn) => (
                <td key={inn} style={tdStyle}>
                  {assignments?.[inn]?.[pos] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Batting Order */}
      <h3 style={{ marginTop: "2rem" }}>Batting Order</h3>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>#</th>
            <th style={thStyle}>Player</th>
          </tr>
        </thead>
        <tbody>
          {battingOrder.map((player, index) => (
            <tr key={index}>
              <td style={tdHeaderStyle}>{index + 1}</td>
              <td style={tdStyle}>{player}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bench Totals */}
      <h3 style={{ marginTop: "2rem" }}>Playing Time & Bench</h3>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Player</th>
            <th style={thStyle}>Played</th>
            <th style={thStyle}>Benched</th>
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
                <td style={tdStyle}>{totalPositions}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Eligibility */}
      <h3 style={{ marginTop: "2rem" }}>Eligibility Matrix</h3>
      <table style={tableStyle}>
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

      {/* Notes */}
      <h3 style={{ marginTop: "2rem" }}>Notes</h3>
      <div
        style={{
          border: "1px solid black",
          minHeight: "100px",
          padding: "0.5rem"
        }}
      ></div>
    </div>
  );
}

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "0.5rem"
};

const thStyle: React.CSSProperties = {
  padding: "0.5rem",
  borderBottom: "1px solid black",
  textAlign: "center",
  fontWeight: 600
};

const tdHeaderStyle: React.CSSProperties = {
  padding: "0.5rem",
  borderBottom: "1px solid black",
  textAlign: "center",
  fontWeight: 600
};

const tdStyle: React.CSSProperties = {
  padding: "0.5rem",
  borderBottom: "1px solid black",
  textAlign: "center"
};
