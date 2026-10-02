import { useState } from "react";
import { Player } from "../teams/TeamContext";

type Props = {
  roster: Player[];
};

type InningAssignments = {
  CF: string;
  LF: string;
  RF: string;
  SS: string;
  "2B": string;
  "3B": string;
  "1B": string;
  P: string;
  C: string;
};

export function DugoutManager({ roster }: Props) {
  const [inning, setInning] = useState(1);

  const autoFill = (): InningAssignments => {
    const get = (pos: string) =>
      roster.find((p) => p.positions.includes(pos))?.name || "—";

    return {
      CF: get("CF"),
      LF: get("LF"),
      RF: get("RF"),
      SS: get("SS"),
      "2B": get("2B"),
      "3B": get("3B"),
      "1B": get("1B"),
      P: get("P"),
      C: get("C")
    };
  };

  const [assignments, setAssignments] = useState<Record<number, InningAssignments>>({
    1: autoFill(),
    2: autoFill(),
    3: autoFill(),
    4: autoFill(),
    5: autoFill(),
    6: autoFill()
  });

  const current = assignments[inning];

  const updatePosition = (pos: keyof InningAssignments, player: string) => {
    setAssignments((prev) => ({
      ...prev,
      [inning]: {
        ...prev[inning],
        [pos]: player
      }
    }));
  };

  const positions: (keyof InningAssignments)[] = [
    "CF",
    "LF",
    "RF",
    "SS",
    "2B",
    "3B",
    "1B",
    "P",
    "C"
  ];

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      
      {/* Top Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <h2>Game 1 vs Eagles</h2>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <select
            value={inning}
            onChange={(e) => setInning(Number(e.target.value))}
            style={{
              padding: "0.5rem",
              background: "#020617",
              color: "#e5e7eb",
              border: "1px solid #1f2937",
              borderRadius: "0.25rem"
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((inn) => (
              <option key={inn} value={inn}>
                Inning {inn}
              </option>
            ))}
          </select>

          <button
            style={btn}
            onClick={() =>
              setAssignments((prev) => ({
                ...prev,
                [inning]: autoFill()
              }))
            }
          >
            Auto-Fill
          </button>

          <button
            style={btn}
            onClick={() =>
              setAssignments((prev) => ({
                ...prev,
                2: { ...prev[inning] }
              }))
            }
          >
            Copy to Inn 2
          </button>

          <button
            style={btn}
            onClick={() =>
              setAssignments((prev) => {
                const updated = { ...prev };
                for (let i = 1; i <= 6; i++) updated[i] = { ...prev[inning] };
                return updated;
              })
            }
          >
            Copy to All
          </button>

          <button style={btn}>Export 6-Inn Card</button>
        </div>
      </div>

      {/* Main Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "1.5rem"
        }}
      >
        {/* Defensive Diamond */}
        <div
          style={{
            border: "1px solid #1f2937",
            borderRadius: "0.5rem",
            padding: "1rem",
            background: "#0b1f33",
            color: "#e5e7eb",
            minHeight: "400px"
          }}
        >
          <h3>Interactive Defensive Diamond</h3>

          <div
            style={{
              display: "grid",
              gridTemplateRows: "repeat(6, 1fr)",
              gridTemplateColumns: "repeat(5, 1fr)",
              height: "350px",
              marginTop: "1rem",
              textAlign: "center",
              fontWeight: "bold"
            }}
          >
            {/* CF */}
            <DiamondCell
              row={1}
              col={3}
              pos="CF"
              player={current.CF}
              roster={roster}
              update={updatePosition}
            />

            {/* LF / RF */}
            <DiamondCell
              row={2}
              col={2}
              pos="LF"
              player={current.LF}
              roster={roster}
              update={updatePosition}
            />
            <DiamondCell
              row={2}
              col={4}
              pos="RF"
              player={current.RF}
              roster={roster}
              update={updatePosition}
            />

            {/* SS */}
            <DiamondCell
              row={3}
              col={3}
              pos="SS"
              player={current.SS}
              roster={roster}
              update={updatePosition}
            />

            {/* 2B / 3B */}
            <DiamondCell
              row={4}
              col={2}
              pos="2B"
              player={current["2B"]}
              roster={roster}
              update={updatePosition}
            />
            <DiamondCell
              row={4}
              col={4}
              pos="3B"
              player={current["3B"]}
              roster={roster}
              update={updatePosition}
            />

            {/* 1B */}
            <DiamondCell
              row={5}
              col={3}
              pos="1B"
              player={current["1B"]}
              roster={roster}
              update={updatePosition}
            />

            {/* P / C */}
            <DiamondCell
              row={6}
              col={3}
              pos="P"
              player={current.P}
              roster={roster}
              update={updatePosition}
            />
            <DiamondCell
              row={6}
              col={3}
              pos="C"
              player={current.C}
              roster={roster}
              update={updatePosition}
              offset
            />
          </div>
        </div>

        {/* Defensive Nine */}
        <div
          style={{
            border: "1px solid #1f2937",
            borderRadius: "0.5rem",
            padding: "1rem",
            background: "#0b1f33",
            color: "#e5e7eb"
          }}
        >
          <h3>Inning {inning} Defensive Nine</h3>

          <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
            {positions.map((pos) => (
              <li
                key={pos}
                style={{
                  padding: "0.5rem 0",
                  borderBottom: "1px solid #1f2937",
                  display: "flex",
                  justifyContent: "space-between"
                }}
              >
                <span>{pos}</span>
                <span>{current[pos]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function DiamondCell({
  row,
  col,
  pos,
  player,
  roster,
  update,
  offset
}: {
  row: number;
  col: number;
  pos: keyof InningAssignments;
  player: string;
  roster: Player[];
  update: (pos: keyof InningAssignments, player: string) => void;
  offset?: boolean;
}) {
  return (
    <div
      style={{
        gridRow: row,
        gridColumn: col,
        marginTop: offset ? "1.5rem" : "0"
      }}
    >
      {pos}
      <br />
      <select
        value={player}
        onChange={(e) => update(pos, e.target.value)}
        style={{
          marginTop: "0.25rem",
          padding: "0.25rem",
          background: "#1e293b",
          color: "#e5e7eb",
          border: "1px solid #334155",
          borderRadius: "0.25rem"
        }}
      >
        <option value="—">—</option>
        {roster.map((p) => (
          <option key={p.id} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}

const btn: React.CSSProperties = {
  padding: "0.5rem 1rem",
  background: "#1e293b",
  color: "#e5e7eb",
  border: "none",
  borderRadius: "0.25rem",
  cursor: "pointer"
};
