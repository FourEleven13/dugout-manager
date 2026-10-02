import { useDrills } from "../teams/DrillsContext";

export function DrillsPage() {
  const { drills, addDrill, deleteDrill } = useDrills();

  const handleAdd = () => {
    const name = prompt("Drill name:");
    if (!name) return;

    const description = prompt("Drill description:");
    if (!description) return;

    addDrill({
      id: crypto.randomUUID(),
      name,
      description
    });
  };

  return (
    <div
      style={{
        border: "1px solid #1f2937",
        borderRadius: "0.5rem",
        padding: "1rem",
        background: "#020617"
      }}
    >
      <h2>Drills Library</h2>

      <button
        onClick={handleAdd}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          background: "#1f7a53",
          border: "none",
          borderRadius: "0.25rem",
          cursor: "pointer",
          color: "#e5e7eb"
        }}
      >
        Add Drill
      </button>

      <ul style={{ marginTop: "1rem", paddingLeft: "1.25rem" }}>
        {drills.map((drill) => (
          <li key={drill.id} style={{ marginBottom: "0.5rem" }}>
            <strong>{drill.name}</strong> — {drill.description}
            <button
              onClick={() => deleteDrill(drill.id)}
              style={{
                marginLeft: "0.5rem",
                background: "#ef4444",
                border: "none",
                padding: "0.25rem 0.5rem",
                borderRadius: "0.25rem",
                cursor: "pointer",
                color: "#fff"
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
