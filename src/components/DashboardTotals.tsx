import { Player } from "../teams/TeamContext";

type Props = {
  roster: Player[];
};

export function DashboardTotals({ roster }: Props) {
  const positions = ["P", "C", "1B", "2B", "SS", "3B", "LF", "CF", "RF"];

  const calculateTotals = (player: Player) => {
    const totals: Record<string, number> = {};
    positions.forEach((pos) => {
      totals[pos] = player.positions.includes(pos) ? 1 : 0;
    });
    totals["Bench"] = 0;
    totals["Total"] = positions.reduce((sum, pos) => sum + totals[pos], 0);
    return totals;
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <h3>Position Totals</h3>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "1rem",
          background: "#0b1f33",
          color: "#e5e7eb"
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>Player</th>
            {positions.map((pos) => (
              <th key={pos} style={thStyle}>{pos}</th>
            ))}
            <th style={thStyle}>Bench</th>
            <th style={thStyle}>Total</th>
          </tr>
        </thead>

        <tbody>
          {roster.map((player) => {
            const totals = calculateTotals(player);
            return (
              <tr key={player.id}>
                <td style={tdStyle}>{player.name}</td>
                {positions.map((pos) => (
                  <td key={pos} style={tdStyle}>
                    {totals[pos]}
                  </td>
                ))}
                <td style={tdStyle}>{totals["Bench"]}</td>
                <td style={tdStyle}>{totals["Total"]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "0.5rem",
  borderBottom: "1px solid #1f2937",
  textAlign: "center"
};

const tdStyle: React.CSSProperties = {
  padding: "0.5rem",
  borderBottom: "1px solid #1f2937",
  textAlign: "center"
};
