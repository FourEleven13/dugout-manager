import { useState } from "react";
import { Player } from "../teams/TeamContext";

type Props = {
  onAdd: (player: Player) => void;
};

export function ManualRosterEntry({ onAdd }: Props) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [positions, setPositions] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    setError(null);

    if (!name.trim()) {
      setError("Player name is required.");
      return;
    }

    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: name.trim(),
      number: number.trim(),
      positions: positions
        .split(/[,\s]+/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
    };

    onAdd(newPlayer);

    // Clear fields
    setName("");
    setNumber("");
    setPositions("");
  };

  return (
    <div
      style={{
        border: "1px solid #1f2937",
        borderRadius: "0.5rem",
        padding: "1rem",
        background: "#020617",
        marginTop: "1rem"
      }}
    >
      <h3>Add Player Manually</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
        <input
          type="text"
          placeholder="Player Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "0.5rem" }}
        />

        <input
          type="text"
          placeholder="Jersey Number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          style={{ padding: "0.5rem" }}
        />

        <input
          type="text"
          placeholder="Positions (comma separated)"
          value={positions}
          onChange={(e) => setPositions(e.target.value)}
          style={{ padding: "0.5rem" }}
        />

        {error && <p style={{ color: "#f97373" }}>{error}</p>}

        <button
          onClick={handleAdd}
          style={{
            padding: "0.5rem 1rem",
            background: "#1f7a53",
            borderRadius: "0.25rem",
            color: "#e5e7eb",
            border: "none",
            cursor: "pointer"
          }}
        >
          Add Player
        </button>
      </div>
    </div>
  );
}
