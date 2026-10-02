import { useState } from "react";
import { Player } from "../teams/TeamContext";
import { FIELD_POSITIONS, FieldPosition } from "../lib/lineupConstants";

type Props = {
  roster: Player[];
  onChange: (roster: Player[]) => void;
};

const positionLabels: FieldPosition[] = [...FIELD_POSITIONS];

export function RosterMatrix({ roster, onChange }: Props) {
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");

  const updatePlayer = (id: string, changes: Partial<Player>) => {
    onChange(roster.map((player) => (player.id === id ? { ...player, ...changes } : player)));
  };

  const togglePosition = (player: Player, position: FieldPosition) => {
    const hasPosition = player.positions.includes(position);
    const positions = hasPosition
      ? player.positions.filter((p) => p !== position)
      : [...player.positions, position];

    updatePlayer(player.id, { positions });
  };

  const addPlayer = () => {
    const name = newName.trim();
    if (!name) return;

    onChange([
      ...roster,
      {
        id: crypto.randomUUID(),
        name,
        number: newNumber.trim(),
        positions: []
      }
    ]);

    setNewName("");
    setNewNumber("");
  };

  const removePlayer = (id: string) => {
    onChange(roster.filter((player) => player.id !== id));
  };

  return (
    <section className="roster-sheet">
      <div className="roster-sheet-header">
        <div>
          <h3>Team Roster</h3>
          <p>Check the positions each player can play. Changes save automatically.</p>
        </div>
        <span className="roster-count">{roster.length} players</span>
      </div>

      <div className="roster-table-wrap">
        <table className="roster-table">
          <thead>
            <tr>
              <th className="player-column">Player</th>
              <th className="number-column">#</th>
              {positionLabels.map((position) => (
                <th key={position} className="position-column">{position}</th>
              ))}
              <th className="remove-column" aria-label="Remove player" />
            </tr>
          </thead>
          <tbody>
            {roster.map((player) => (
              <tr key={player.id}>
                <td>
                  <input
                    className="roster-text-input player-name-input"
                    value={player.name}
                    aria-label={`Player name for ${player.name}`}
                    onChange={(e) => updatePlayer(player.id, { name: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    className="roster-text-input number-input"
                    value={player.number}
                    aria-label={`Jersey number for ${player.name}`}
                    onChange={(e) => updatePlayer(player.id, { number: e.target.value })}
                  />
                </td>
                {positionLabels.map((position) => (
                  <td key={position} className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={player.positions.includes(position)}
                      aria-label={`${player.name} can play ${position}`}
                      onChange={() => togglePosition(player, position)}
                    />
                  </td>
                ))}
                <td className="remove-cell">
                  <button
                    type="button"
                    className="remove-player-button"
                    title={`Remove ${player.name}`}
                    aria-label={`Remove ${player.name}`}
                    onClick={() => removePlayer(player.id)}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}

            <tr className="add-player-row">
              <td>
                <input
                  className="roster-text-input player-name-input"
                  placeholder="Add player..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addPlayer();
                  }}
                />
              </td>
              <td>
                <input
                  className="roster-text-input number-input"
                  placeholder="#"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addPlayer();
                  }}
                />
              </td>
              {positionLabels.map((position) => (
                <td key={position} className="checkbox-cell" />
              ))}
              <td className="add-cell">
                <button type="button" className="add-player-button" onClick={addPlayer}>
                  +
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="roster-sheet-footer">
        <span>✓ Checked positions are used by the lineup generator.</span>
        <span>Scroll horizontally on a phone to see all positions.</span>
      </div>
    </section>
  );
}
