import React from "react";
import { Player } from "../teams/TeamContext";
import { useLineupStore } from "../store/LineupStore";

type Props = {
  roster: Player[];
};

export function BattingOrder({ roster }: Props) {
  const { battingOrder, setBattingOrder } = useLineupStore();

  // ⭐ Prevent crash if roster is undefined or still loading
  const safeRoster = Array.isArray(roster) ? roster : [];

  const maxSlots = safeRoster.length;

  const updateSlot = (index: number, player: string) => {
    const updated = [...battingOrder];

    // prevent duplicates
    if (player !== "—" && updated.includes(player)) {
      return;
    }

    updated[index] = player;
    setBattingOrder(updated);
  };

  const clearOrder = () => {
    setBattingOrder(Array(maxSlots).fill("—"));
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem"
        }}
      >
        <h2>Batting Order</h2>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button style={btn} onClick={clearOrder}>
            Clear
          </button>
          <button style={btn} onClick={printPage}>
            Print This Page
          </button>
        </div>
      </div>

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
              <th style={thStyle}>#</th>
              <th style={thStyle}>Player</th>
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: maxSlots }).map((_, index) => (
              <tr key={index}>
                <td style={tdHeaderStyle}>{index + 1}</td>
                <td style={tdStyle}>
                  <select
                    value={battingOrder[index] || "—"}
                    onChange={(e) => updateSlot(index, e.target.value)}
                    style={selectStyle}
                  >
                    <option value="—">—</option>

                    {/* ⭐ safeRoster ALWAYS an array */}
                    {safeRoster.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.25rem",
  background: "#1e293b",
  color: "#e5e7eb",
  border: "1px solid #334155",
  borderRadius: "0.25rem",
  fontSize: "0.8rem"
};
