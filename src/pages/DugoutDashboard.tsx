import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Player } from "../teams/TeamContext";
import { useLineupStore } from "../store/LineupStore";
import {
  BENCH_KEY,
  FIELD_POSITIONS,
  FieldPosition,
  TOTAL_INNINGS
} from "../lib/lineupConstants";
import { validateLineup, validateRoster, type LineupWarning } from "../lib/lineupValidation";
import "../styles/dugout-dashboard.css";

type Props = {
  roster: Player[];
};

const NODE_LAYOUT: Record<FieldPosition, { top: string; left: string }> = {
  P: { top: "64.6%", left: "50%" },
  C: { top: "92%", left: "50%" },
  "1B": { top: "64.6%", left: "78.1%" },
  "2B": { top: "47.9%", left: "62.5%" },
  "3B": { top: "64.6%", left: "21.9%" },
  SS: { top: "47.9%", left: "37.5%" },
  LF: { top: "27.1%", left: "20.8%" },
  CF: { top: "16.7%", left: "50%" },
  RF: { top: "27.1%", left: "79.2%" }
};

export function DugoutDashboard({ roster }: Props) {
  const {
    playerLineups,
    setPlayerLineups,
    saveLineups,
    applyAutoGenerate,
    syncFromPlayerLineups
  } = useLineupStore();

  const [currentInning, setCurrentInning] = useState(0);
  const [status, setStatus] = useState<"ready" | "dirty" | "saving" | "saved">(
    "ready"
  );
  const [error, setError] = useState<string | null>(null);
  const rosterValidation = useMemo(() => validateRoster(roster), [roster]);
  const lineupValidation = useMemo(
    () => validateLineup(roster, playerLineups),
    [roster, playerLineups]
  );

  useEffect(() => {
    if (roster.length > 0) {
      syncFromPlayerLineups(roster);
    }
  }, [roster, syncFromPlayerLineups]);

  const fieldState = useMemo(() => {
    const byPosition: Record<FieldPosition, string> = {} as Record<
      FieldPosition,
      string
    >;
    FIELD_POSITIONS.forEach((pos) => {
      byPosition[pos] = "VACANT";
    });
    const bench: string[] = [];

    roster.forEach((player) => {
      const slots = playerLineups[player.name];
      if (!slots) return;
      const assigned = slots[currentInning] || BENCH_KEY;
      if (FIELD_POSITIONS.includes(assigned as FieldPosition)) {
        byPosition[assigned as FieldPosition] = player.name;
      } else {
        bench.push(player.name);
      }
    });

    return { byPosition, bench };
  }, [roster, playerLineups, currentInning]);

  const updateCell = (playerName: string, inningIndex: number, value: string) => {
    setPlayerLineups((prev) => ({
      ...prev,
      [playerName]: prev[playerName].map((v, i) =>
        i === inningIndex ? value : v
      )
    }));
    setStatus("dirty");
  };

  const handleSave = async () => {
    setStatus("saving");
    try {
      await saveLineups(roster);
      setStatus("saved");
      window.setTimeout(() => setStatus("ready"), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
      setStatus("dirty");
    }
  };

  const handleAutoBalance = async () => {
    setError(null);
    if (!rosterValidation.canGenerate) {
      setError(rosterValidation.warnings.map((warning) => warning.detail).join(" "));
      return;
    }
    try {
      await applyAutoGenerate(roster);
      setStatus("saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Auto-balance failed.");
    }
  };

  if (!roster.length) {
    return (
      <div className="dugout-app">
        <div className="dugout-empty-roster">
          <h2 style={{ marginTop: 0 }}>⚾ Dugout Manager</h2>
          <p>
            Add your team roster first (same idea as the <strong>Roster</strong>{" "}
            tab in your Baseball Lineup spreadsheet). Each player needs position
            eligibility (Yes/No columns → checked positions in the app).
          </p>
          <Link to="/app/roster" className="dugout-btn-primary" style={{ display: "inline-block", padding: "10px 16px", borderRadius: 6, color: "#fff", textDecoration: "none" }}>
            Set up roster
          </Link>
        </div>
      </div>
    );
  }

  const statusLabel =
    status === "dirty"
      ? "Unsaved Changes"
      : status === "saving"
        ? "Saving..."
        : status === "saved"
          ? "Saved"
          : "Ready";

  const statusColor =
    status === "dirty" ? "#d32f2f" : status === "saved" ? "#2e7d32" : "#2e7d32";

  return (
    <div className="dugout-app">
      <div className="dugout-top-nav">
        <div className="dugout-metrics">
          <div className="dugout-metric-item">
            <span className="dugout-metric-label">Total Roster</span>
            <span className="dugout-metric-value">{roster.length}</span>
          </div>
          <div className="dugout-metric-item">
            <span className="dugout-metric-label">Positions</span>
            <span className="dugout-metric-value">9 Field + Bench</span>
          </div>
          <div className="dugout-metric-item">
            <span className="dugout-metric-label">Status</span>
            <span className="dugout-metric-value" style={{ color: statusColor }}>
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="dugout-toolbar">
          <label htmlFor="inningSelect" style={{ fontWeight: 700, fontSize: 13 }}>
            Inning:
          </label>
          <select
            id="inningSelect"
            value={currentInning}
            onChange={(e) => setCurrentInning(Number(e.target.value))}
          >
            {Array.from({ length: TOTAL_INNINGS }, (_, i) => (
              <option key={i} value={i}>
                Inning {i + 1}
              </option>
            ))}
          </select>
          <button type="button" className="dugout-btn-primary" onClick={handleAutoBalance}>
            ⚡ Auto-Balance
          </button>
          <button type="button" className="dugout-btn-success" onClick={handleSave}>
            💾 Save Changes
          </button>
        </div>
      </div>

      {error && (
        <div className="dugout-alert dugout-alert-error" role="alert">
          <strong>🔴 Lineup cannot be generated</strong>
          <span>{error}</span>
        </div>
      )}

      {!error && lineupValidation.warnings.length > 0 && (
        <div className="dugout-alert-panel" role="status">
          <div className="dugout-alert-heading">
            <strong>🟡 Review your game plan</strong>
            <span>{lineupValidation.warnings.length} item{lineupValidation.warnings.length === 1 ? "" : "s"} to review</span>
          </div>
          <div className="dugout-alert-list">
            {lineupValidation.warnings.map((warning, index) => (
              <WarningRow key={`${warning.title}-${index}`} warning={warning} />
            ))}
          </div>
        </div>
      )}

      {!error && lineupValidation.warnings.length === 0 && roster.length >= 9 && (
        <div className="dugout-alert dugout-alert-success" role="status">
          <strong>🟢 Lineup looks good</strong>
          <span>No position conflicts or open defensive positions detected.</span>
        </div>
      )}

      <div className="dugout-container">
        <div className="dugout-field-card">
          <h3 style={{ margin: "0 0 10px 0", fontSize: 15 }}>
            ⚾ Defensive Diamond Visualization
          </h3>
          <div className="dugout-diamond-container">
            <svg
              className="dugout-field-svg"
              viewBox="0 0 480 480"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M 240 430 L 20 210 A 300 300 0 0 1 460 210 Z" fill="#2d7c38" />
              <path
                d="M 20 210 A 300 300 0 0 1 460 210 L 452 218 A 288 288 0 0 0 28 218 Z"
                fill="#a07855"
                opacity="0.65"
              />
              <path d="M 240 430 L 105 295 A 190 190 0 0 1 375 295 Z" fill="#b98a58" />
              <path d="M 240 430 L 120 310 L 240 190 L 360 310 Z" fill="#a77644" />
              <polygon points="240,412 138,310 240,208 342,310" fill="#2d7c38" />
              <line x1="240" y1="430" x2="20" y2="210" stroke="#ffffff" strokeWidth="2.5" />
              <line x1="240" y1="430" x2="460" y2="210" stroke="#ffffff" strokeWidth="2.5" />
              <circle cx="240" cy="310" r="19" fill="#936435" stroke="#7a5229" strokeWidth="1.5" />
              <rect x="235" y="308" width="10" height="4" fill="#ffffff" rx="1" />
              <polygon points="240,432 234,424 234,420 246,420 246,424" fill="#ffffff" stroke="#222" strokeWidth="1" />
            </svg>

            {FIELD_POSITIONS.map((pos) => (
              <div
                key={pos}
                className="dugout-position-node"
                style={{
                  top: NODE_LAYOUT[pos].top,
                  left: NODE_LAYOUT[pos].left
                }}
              >
                <span className={`dugout-pos-badge dugout-pos-${pos}`}>{pos}</span>
                <div className="dugout-player-name">{fieldState.byPosition[pos]}</div>
              </div>
            ))}
          </div>

          <div className="dugout-bench-row">
            <span className="dugout-bench-label">DUGOUT / BENCH:</span>
            <div className="dugout-bench-chips">
              {fieldState.bench.length === 0 ? (
                <span style={{ fontSize: 11, color: "#888" }}>No players sitting</span>
              ) : (
                fieldState.bench.map((name) => (
                  <div key={name} className="dugout-bench-chip">
                    {name}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="dugout-roster-card">
          <h3 style={{ margin: "0 0 10px 0", fontSize: 15 }}>
            📋 6-Inning Defensive Rotation Card
          </h3>
          <div className="dugout-table-wrapper">
            <table className="dugout-table">
              <thead>
                <tr>
                  <th>Player</th>
                  {Array.from({ length: TOTAL_INNINGS }, (_, i) => (
                    <th
                      key={i}
                      className={i === currentInning ? "dugout-active-inning-col" : undefined}
                    >
                      Inn {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roster.map((player) => {
                  const row = playerLineups[player.name] || [];
                  return (
                    <tr key={player.id}>
                      <td>
                        <strong>{player.name}</strong>
                      </td>
                      {Array.from({ length: TOTAL_INNINGS }, (_, inn) => {
                        const currentVal = row[inn] || BENCH_KEY;
                        const options = [BENCH_KEY, ...FIELD_POSITIONS];
                        return (
                          <td
                            key={inn}
                            className={
                              inn === currentInning ? "dugout-active-inning-col" : undefined
                            }
                          >
                            <select
                              className="dugout-table-select"
                              value={currentVal}
                              onChange={(e) =>
                                updateCell(player.name, inn, e.target.value)
                              }
                            >
                              {options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
