import { useState } from "react";
import Papa from "papaparse";
import { Player } from "../teams/TeamContext";

type Props = {
  onUpload: (players: Player[]) => void;
};

export function RosterUpload({ onUpload }: Props) {
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const players: Player[] = (results.data as any[]).map((row) => ({
            id: crypto.randomUUID(),
            name: row.Name || row.Player || row.player || "",
            number: row.Number || row.Jersey || row.jersey || "",
            positions: (row.Positions || row.positions || "")
              .split(/[,\s]+/)
              .filter((p: string) => p)
          })).filter((p) => p.name);

          if (!players.length) {
            setError("No valid players found in file.");
            return;
          }

          onUpload(players);
        } catch (e: any) {
          setError(e.message || "Failed to parse roster file.");
        }
      },
      error: (err) => {
        setError(err.message);
      }
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
      <h3>Upload roster (CSV)</h3>
      <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
        Export your roster from GameChanger or your league system as CSV, then upload it here.
      </p>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        style={{ marginTop: "0.75rem" }}
      />
      {error && <p style={{ color: "#f97373", marginTop: "0.5rem" }}>{error}</p>}
    </div>
  );
}
