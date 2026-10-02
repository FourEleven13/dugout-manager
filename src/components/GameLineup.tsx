import { Player } from "../teams/TeamContext";

type Props = {
  roster: Player[];
};

export function GameLineup({ roster }: Props) {
  const starters = roster.slice(0, 9);
  const bench = roster.slice(9);

  return (
    <section
      style={{
        border: "1px solid #1f2937",
        borderRadius: "0.5rem",
        padding: "1rem",
        background: "#020617"
      }}
    >
      <h3>Game Lineup (auto draft)</h3>
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <h4>Starters</h4>
          <ol style={{ paddingLeft: "1.25rem" }}>
            {starters.map((p, idx) => (
              <li key={p.id}>
                {idx + 1}. {p.name} #{p.number}
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h4>Bench</h4>
          <ul style={{ paddingLeft: "1.25rem" }}>
            {bench.map((p) => (
              <li key={p.id}>
                {p.name} #{p.number}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
