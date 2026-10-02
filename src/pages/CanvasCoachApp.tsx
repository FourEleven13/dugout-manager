import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

type Pos = "P" | "C" | "1B" | "2B" | "3B" | "SS" | "LF" | "CF" | "RF" | "BENCH";
type Player = {
  id: number;
  name: string;
  number: number;
  status: "ACTIVE" | "OUT";
  eligible: Exclude<Pos, "BENCH">[];
  innings: number;
  bench: number;
  pitches: number;
};

const POS: Exclude<Pos, "BENCH">[] = [
  "P",
  "C",
  "1B",
  "2B",
  "3B",
  "SS",
  "LF",
  "CF",
  "RF"
];
const POS_COLORS: Record<string, string> = {
  P: "#5b4ae6",
  C: "#2f8f68",
  "1B": "#d28a19",
  "2B": "#d28a19",
  "3B": "#d28a19",
  SS: "#d28a19",
  LF: "#2677a9",
  CF: "#2677a9",
  RF: "#2677a9",
  BENCH: "#94a3b8"
};

const initialPlayers: Player[] = [
  {
    id: 1,
    name: "Hunter",
    number: 10,
    status: "ACTIVE",
    eligible: ["P", "C", "1B", "2B", "3B", "SS", "LF", "CF"],
    innings: 20,
    bench: 4,
    pitches: 48
  },
  {
    id: 2,
    name: "Keagen",
    number: 2,
    status: "ACTIVE",
    eligible: ["P", "2B", "SS", "LF", "CF", "RF"],
    innings: 18,
    bench: 6,
    pitches: 0
  },
  {
    id: 3,
    name: "Layne",
    number: 7,
    status: "ACTIVE",
    eligible: ["P", "C", "1B", "2B", "3B", "SS", "LF", "RF"],
    innings: 20,
    bench: 4,
    pitches: 18
  },
  {
    id: 4,
    name: "Charles",
    number: 24,
    status: "OUT",
    eligible: ["P", "1B", "3B", "LF", "CF", "RF"],
    innings: 21,
    bench: 3,
    pitches: 0
  },
  {
    id: 5,
    name: "Wyatt",
    number: 5,
    status: "ACTIVE",
    eligible: ["P", "C", "2B", "SS", "LF", "CF", "RF"],
    innings: 20,
    bench: 4,
    pitches: 32
  },
  {
    id: 6,
    name: "Travis",
    number: 18,
    status: "ACTIVE",
    eligible: ["P", "1B", "3B", "LF", "CF", "RF"],
    innings: 20,
    bench: 4,
    pitches: 0
  },
  {
    id: 7,
    name: "Ryan",
    number: 12,
    status: "ACTIVE",
    eligible: ["P", "C", "1B", "3B", "LF", "CF", "RF"],
    innings: 19,
    bench: 5,
    pitches: 44
  },
  {
    id: 8,
    name: "Grey",
    number: 9,
    status: "ACTIVE",
    eligible: ["C", "2B", "LF", "CF", "RF"],
    innings: 18,
    bench: 6,
    pitches: 0
  },
  {
    id: 9,
    name: "Ethan",
    number: 3,
    status: "ACTIVE",
    eligible: ["C", "2B", "LF", "CF", "RF"],
    innings: 15,
    bench: 9,
    pitches: 0
  },
  {
    id: 10,
    name: "Cruz",
    number: 11,
    status: "ACTIVE",
    eligible: ["P", "2B", "SS", "LF", "CF", "RF"],
    innings: 16,
    bench: 8,
    pitches: 0
  },
  {
    id: 11,
    name: "Gage",
    number: 14,
    status: "ACTIVE",
    eligible: ["C", "LF", "CF", "RF"],
    innings: 12,
    bench: 12,
    pitches: 0
  },
  {
    id: 12,
    name: "Corey",
    number: 27,
    status: "ACTIVE",
    eligible: ["P", "1B", "RF"],
    innings: 11,
    bench: 13,
    pitches: 0
  }
];

/** Default 6-inning defensive assignments: inning → position → player name */
function buildDefaultRotation(players: Player[]): Record<number, Record<string, string>> {
  const active = players.filter((p) => p.status === "ACTIVE");
  const out = players.filter((p) => p.status === "OUT");
  const all = [...active, ...out];
  const rot: Record<number, Record<string, string>> = {};

  // Seed from screenshot-like assignments for inning 1, then rotate
  const seed: Record<string, string> = {
    P: "Hunter",
    C: "Layne",
    "1B": "Charles",
    "2B": "Keagen",
    "3B": "Wyatt",
    SS: "Grey",
    LF: "Cruz",
    CF: "Travis",
    RF: "Ethan"
  };

  for (let inn = 0; inn < 6; inn++) {
    rot[inn] = {};
    const used = new Set<string>();
    for (const pos of POS) {
      // shift seed slightly each inning for variety
      const names = all.map((p) => p.name);
      let pick = seed[pos];
      if (inn > 0) {
        const idx = names.indexOf(seed[pos]);
        pick = names[(idx + inn) % names.length] || names[0];
      }
      // avoid double-assign in same inning when possible
      if (used.has(pick)) {
        const free = names.find((n) => !used.has(n));
        if (free) pick = free;
      }
      rot[inn][pos] = pick;
      used.add(pick);
    }
  }
  return rot;
}

function buildDefaultBatting(players: Player[]): string[] {
  // Prefer ACTIVE first, keep OUT in order but flagged later
  const active = players.filter((p) => p.status === "ACTIVE").map((p) => p.name);
  const out = players.filter((p) => p.status === "OUT").map((p) => p.name);
  return [...active, ...out].slice(0, 12);
}

function Pill({
  children,
  tone = "green"
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={`pill ${tone}`}>{children}</span>;
}
function Section({
  title,
  sub,
  children,
  action
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="section">
      <div className="section-head">
        <div>
          <h2>{title}</h2>
          {sub && <p>{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
function Btn({
  children,
  onClick,
  kind = "light",
  disabled = false
}: {
  children: React.ReactNode;
  onClick?: () => void;
  kind?: string;
  disabled?: boolean;
}) {
  return (
    <button disabled={disabled} className={`btn ${kind}`} onClick={onClick}>
      {children}
    </button>
  );
}

export function CanvasCoachApp() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [players, setPlayers] = useState(initialPlayers);
  const [view, setView] = useState("players");
  const [orgName, setOrgName] = useState("Metro Youth Baseball");
  const [team, setTeam] = useState("Thunderbirds 12U Majors");
  const [league, setLeague] = useState("Metro Youth Baseball League");
  const [teams, setTeams] = useState([
    {
      id: "t1",
      name: "Thunderbirds 12U Majors",
      division: "12U Majors",
      headCoach: "Mike Cassidy",
      diamond: "Field #2 North Diamond",
      games: 1,
      active: true
    },
    {
      id: "t2",
      name: "Wildcats 12U Minors",
      division: "12U Minors",
      headCoach: "Dave Miller",
      diamond: "Field #4 South Field",
      games: 1,
      active: false
    },
    {
      id: "t3",
      name: "Tigers 10U Prep",
      division: "10U Prep",
      headCoach: "Coach Bill Adams",
      diamond: "Field #1 East Diamond",
      games: 1,
      active: false
    }
  ]);
  const [gameLocked, setGameLocked] = useState(false);
  const [innings, setInnings] = useState(6);
  const [rotation, setRotation] = useState(() =>
    buildDefaultRotation(initialPlayers)
  );
  const [batting, setBatting] = useState(() =>
    buildDefaultBatting(initialPlayers)
  );
  const [pitchMax, setPitchMax] = useState(85);
  const [diamondInn, setDiamondInn] = useState(0);
  const [practice, setPractice] = useState({
    duration: 90,
    field: "Field #2 North Diamond",
    focus: "Defense + Hitting"
  });
  const [toast, setToast] = useState("");
  const [orgTab, setOrgTab] = useState("teams");
  const [editingName, setEditingName] = useState<
    null | "org" | "league" | "team"
  >(null);
  const [nameDraft, setNameDraft] = useState("");

  const startRename = (kind: "org" | "league" | "team", current: string) => {
    setEditingName(kind);
    setNameDraft(current);
  };

  const commitRename = () => {
    const next = nameDraft.trim();
    if (!next || !editingName) {
      setEditingName(null);
      return;
    }
    if (editingName === "org") {
      setOrgName(next);
      notify(`Organization renamed to “${next}”`);
    } else if (editingName === "league") {
      setLeague(next);
      notify(`League renamed to “${next}”`);
    } else if (editingName === "team") {
      setTeam(next);
      setTeams((list) =>
        list.map((t) =>
          t.active || t.name === team ? { ...t, name: next, active: true } : t
        )
      );
      notify(`Team renamed to “${next}”`);
    }
    setEditingName(null);
  };

  const renameTeamById = (id: string, newName: string) => {
    const next = newName.trim();
    if (!next) return;
    setTeams((list) =>
      list.map((t) => (t.id === id ? { ...t, name: next } : t))
    );
    const wasActive = teams.find((t) => t.id === id)?.active;
    if (wasActive) setTeam(next);
    notify(`Team renamed to “${next}”`);
  };

  const switchActiveTeam = (id: string) => {
    setTeams((list) =>
      list.map((t) => ({ ...t, active: t.id === id }))
    );
    const found = teams.find((t) => t.id === id);
    if (found) {
      setTeam(found.name);
      notify(`Switched to ${found.name}`);
    }
  };

  const active = useMemo(
    () => players.filter((p) => p.status === "ACTIVE"),
    [players]
  );
  const totals = useMemo(
    () => ({
      total: players.length,
      active: active.length,
      out: players.length - active.length,
      eligible: active.filter((p) => p.eligible.length >= 6).length,
      pitches: players.reduce((s, p) => s + p.pitches, 0),
      innings: players.reduce((s, p) => s + p.innings, 0),
      battery: active.filter((p) => p.eligible.includes("P") || p.eligible.includes("C"))
        .length,
      infield: active.filter((p) =>
        ["1B", "2B", "3B", "SS"].some((x) =>
          p.eligible.includes(x as Exclude<Pos, "BENCH">)
        )
      ).length,
      outfield: active.filter((p) =>
        ["LF", "CF", "RF"].some((x) =>
          p.eligible.includes(x as Exclude<Pos, "BENCH">)
        )
      ).length
    }),
    [players, active]
  );

  // Keep batting list in sync when roster status changes (add/remove OUT at end)
  useEffect(() => {
    setBatting((prev) => {
      const names = players.map((p) => p.name);
      const still = prev.filter((n) => names.includes(n));
      const missing = names.filter((n) => !still.includes(n));
      return [...still, ...missing].slice(0, 12);
    });
  }, [players]);

  const notify = (s: string) => {
    setToast(s);
    window.setTimeout(() => setToast(""), 2600);
  };

  const toggleStatus = (id: number) =>
    setPlayers((ps) =>
      ps.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "ACTIVE" ? "OUT" : "ACTIVE" }
          : p
      )
    );

  const togglePos = (id: number, pos: Exclude<Pos, "BENCH">) =>
    setPlayers((ps) =>
      ps.map((p) =>
        p.id === id
          ? {
              ...p,
              eligible: p.eligible.includes(pos)
                ? p.eligible.filter((x) => x !== pos)
                : [...p.eligible, pos]
            }
          : p
      )
    );

  const swapBat = (i: number, dir: number) => {
    const j = i + dir;
    if (j < 0 || j >= batting.length) return;
    const b = [...batting];
    [b[i], b[j]] = [b[j], b[i]];
    setBatting(b);
  };

  const setRotPlayer = (inn: number, pos: string, playerName: string) => {
    setRotation((r) => ({
      ...r,
      [inn]: { ...r[inn], [pos]: playerName }
    }));
  };

  const playerAt = (inn: number, pos: string) => rotation[inn]?.[pos] || "";

  const validate = () => {
    const errs: string[] = [];
    for (let i = 0; i < innings; i++) {
      const row = rotation[i] || {};
      const vals = POS.map((p) => row[p]).filter(Boolean);
      if (new Set(vals).size !== vals.length) {
        errs.push(`Inning ${i + 1}: duplicate defensive assignment.`);
      }
      POS.forEach((pos) => {
        const name = row[pos];
        if (!name) {
          errs.push(`Inning ${i + 1}: ${pos} is empty.`);
          return;
        }
        const player = players.find((p) => p.name === name);
        if (!player) return;
        if (player.status === "OUT") {
          errs.push(
            `Inning ${i + 1}: ${player.name} (#${player.number}) at ${pos} is marked Absent but assigned to field.`
          );
        }
        if (!player.eligible.includes(pos)) {
          errs.push(
            `Inning ${i + 1}: ${player.name} is not eligible for ${pos}.`
          );
        }
      });
    }
    if (active.length < 9)
      errs.push("Fewer than 9 active players are available.");
    return errs;
  };
  const warnings = validate();

  const autoBalance = () => {
    setRotation(buildDefaultRotation(players));
    notify("Rotation auto-balanced from active roster");
  };

  const autoSubAbsent = () => {
    setRotation((r) => {
      const next = { ...r };
      for (let i = 0; i < 6; i++) {
        const row = { ...next[i] };
        const used = new Set(Object.values(row));
        POS.forEach((pos) => {
          const name = row[pos];
          const pl = players.find((p) => p.name === name);
          if (pl && pl.status === "OUT") {
            const sub = active.find((a) => !used.has(a.name));
            if (sub) {
              row[pos] = sub.name;
              used.add(sub.name);
            }
          }
        });
        next[i] = row;
      }
      return next;
    });
    notify("Absent players auto-subbed with bench");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  // Position for a player in a given inning (for player cards mini rotation)
  const playerPosInInning = (name: string, inn: number): string => {
    const row = rotation[inn] || {};
    for (const pos of POS) {
      if (row[pos] === name) return pos;
    }
    return "—";
  };

  return (
    <div className="canvas-app">
      <header className="topbar">
        <div className="brand-mini">
          ⚾ <b>Dugout Manager</b>
        </div>
        <div className="top-actions">
          <Btn kind="purple" onClick={() => notify("Share link copied")}>
            ↗ Share Team
          </Btn>
          <Btn kind="green" onClick={() => notify("Team saved")}>
            ✓ Save
          </Btn>
          <Btn kind="dark" onClick={() => setGameLocked((v) => !v)}>
            {gameLocked ? "🔒 Game Locked" : "🔓 Lock Game Rules"}
          </Btn>
          <span className="user">
            {user?.email || "coach@team.com"}
            {role ? ` · ${role}` : ""}
          </span>
          <Btn kind="ghost" onClick={() => void handleLogout()}>
            Log out
          </Btn>
        </div>
      </header>

      <div className="subbar">
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          <button
            className="textbtn"
            style={{ fontWeight: 800, color: "#1d8b63" }}
            onClick={() => {
              void handleLogout();
            }}
          >
            ★ Hero & Sales Pitch
          </button>
          <span className="muted">|</span>
          {editingName === "org" ? (
            <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename();
                  if (e.key === "Escape") setEditingName(null);
                }}
                style={{ minWidth: 180, padding: "4px 8px" }}
              />
              <Btn kind="green" onClick={commitRename}>Save</Btn>
              <Btn onClick={() => setEditingName(null)}>Cancel</Btn>
            </span>
          ) : (
            <>
              <b>{orgName}</b>
              <Btn kind="purple" onClick={() => startRename("org", orgName)}>
                ✎ Rename Org
              </Btn>
            </>
          )}
          <span className="muted">•</span>
          {editingName === "league" ? (
            <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename();
                  if (e.key === "Escape") setEditingName(null);
                }}
                style={{ minWidth: 200, padding: "4px 8px" }}
              />
              <Btn kind="green" onClick={commitRename}>Save</Btn>
              <Btn onClick={() => setEditingName(null)}>Cancel</Btn>
            </span>
          ) : (
            <>
              <b>{league}</b>
              <Btn kind="purple" onClick={() => startRename("league", league)}>
                ✎ Rename League
              </Btn>
            </>
          )}
          <span className="muted">•</span>
          <select
            value={teams.find((t) => t.active)?.id || teams[0]?.id}
            onChange={(e) => switchActiveTeam(e.target.value)}
            style={{ padding: "4px 8px", fontWeight: 700 }}
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <Pill>{teams.length} Teams</Pill>
        </div>
        <div className="coachline">
          Coach: Mike Cassidy <Pill>Org Owner</Pill>{" "}
          <button className="textbtn" onClick={() => setView("org")}>
            Requests <Pill tone="purple">2</Pill>
          </button>{" "}
          <button className="textbtn" onClick={() => setView("org")}>
            Switch Role
          </button>{" "}
          <button className="textbtn" onClick={() => setView("audit")}>
            Audit Log
          </button>
        </div>
      </div>

      <main className="workspace">
        <div className="teamhead">
          <div>
            <div className="eyebrow">DUGOUT MANAGER</div>
            {editingName === "team" ? (
              <h1 style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                ⚾{" "}
                <input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") setEditingName(null);
                  }}
                  style={{
                    fontSize: "1em",
                    fontWeight: 800,
                    padding: "6px 12px",
                    minWidth: 260,
                    borderRadius: 8,
                    border: "2px solid #1d8b63"
                  }}
                />
                <Btn kind="green" onClick={commitRename}>Save Team Name</Btn>
                <Btn onClick={() => setEditingName(null)}>Cancel</Btn>
              </h1>
            ) : (
              <h1>
                ⚾ {team}{" "}
                <Btn kind="green" onClick={() => startRename("team", team)}>
                  ✎ Rename Team
                </Btn>
              </h1>
            )}
            <div className="subcopy">
              Official Lineups, Jersey #, Rotations & Group Chat Exporter · Org:{" "}
              <b>{orgName}</b> · League: <b>{league}</b>
            </div>
          </div>
          <div className="teamtools">
            <Pill tone="green">
              {teams.find((t) => t.active)?.division || "12U Majors"}
            </Pill>
            <Pill tone="green">Synced Roster</Pill>
            <Btn kind="purple" onClick={() => startRename("league", league)}>
              ✎ Rename League
            </Btn>
            <Btn kind="light" onClick={() => notify("Team link copied")}>
              ⧉ Copy Link
            </Btn>
          </div>
        </div>

        <div className="navtabs">
          <Nav onClick={() => setView("players")} active={view === "players"}>
            👥 Player Cards & Roster <Pill>{players.length} PLAYERS</Pill>
          </Nav>
          <Nav onClick={() => setView("rotation")} active={view === "rotation"}>
            ↻ Defensive Rotations <Pill>{innings} INN</Pill>
          </Nav>
          <Nav onClick={() => setView("diamond")} active={view === "diamond"}>
            ◉ Defensive Diamond <Pill>Inn {diamondInn + 1}</Pill>
          </Nav>
          <Nav onClick={() => setView("print")} active={view === "print"}>
            ▤ Print Lineup Card <Pill>LINEUP 1–12</Pill>
          </Nav>
          <Nav onClick={() => setView("pitch")} active={view === "pitch"}>
            ⚾ Pitch Smart & Rules <Pill tone="red">SAFETY LOCK</Pill>
          </Nav>
        </div>

        {toast && <div className="toast">✓ {toast}</div>}

        {view === "players" && (
          <Players
            players={players}
            totals={totals}
            toggleStatus={toggleStatus}
            togglePos={togglePos}
            playerPosInInning={playerPosInInning}
            notify={notify}
          />
        )}
        {view === "rotation" && (
          <Rotation
            players={players}
            rotation={rotation}
            setRotPlayer={setRotPlayer}
            warnings={warnings}
            autoBalance={autoBalance}
            autoSubAbsent={autoSubAbsent}
            innings={innings}
            setInnings={setInnings}
            playerAt={playerAt}
          />
        )}
        {view === "diamond" && (
          <Diamond
            players={players}
            rotation={rotation}
            setRotPlayer={setRotPlayer}
            diamondInn={diamondInn}
            setDiamondInn={setDiamondInn}
            playerAt={playerAt}
            setView={setView}
          />
        )}
        {view === "print" && (
          <PrintCard
            team={team}
            batting={batting}
            rotation={rotation}
            players={players}
            swapBat={swapBat}
            setBatting={setBatting}
            onPrint={() => window.print()}
          />
        )}
        {view === "pitch" && (
          <Pitch players={players} max={pitchMax} setMax={setPitchMax} />
        )}
        {view === "practice" && (
          <Practice
            practice={practice}
            setPractice={setPractice}
            notify={notify}
          />
        )}
        {view === "umpire" && (
          <Umpire team={team} batting={batting} rotation={rotation} players={players} />
        )}
        {view === "equity" && <Equity players={players} />}
        {view === "org" && (
          <Org
            orgTab={orgTab}
            setOrgTab={setOrgTab}
            notify={notify}
            orgName={orgName}
            setOrgName={setOrgName}
            league={league}
            setLeague={setLeague}
            teams={teams}
            renameTeamById={renameTeamById}
            switchActiveTeam={switchActiveTeam}
            startRename={startRename}
          />
        )}
        {view === "audit" && <Audit />}

        <div className="secondary-nav">
          <Nav onClick={() => setView("practice")} active={view === "practice"}>
            🗓 Practice Planner
          </Nav>
          <Nav onClick={() => setView("umpire")} active={view === "umpire"}>
            ⚾ Umpire Plate Card
          </Nav>
          <Nav onClick={() => setView("equity")} active={view === "equity"}>
            ◒ Equity Report
          </Nav>
          <Nav onClick={() => setView("org")} active={view === "org"}>
            ⚙ Org & League Admin
          </Nav>
        </div>
      </main>
    </div>
  );
}

function Nav({
  children,
  onClick,
  active
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button onClick={onClick} className={`navtab ${active ? "active" : ""}`}>
      {children}
    </button>
  );
}

function Players({
  players,
  totals,
  toggleStatus,
  togglePos,
  playerPosInInning,
  notify
}: {
  players: Player[];
  totals: any;
  toggleStatus: (id: number) => void;
  togglePos: (id: number, pos: Exclude<Pos, "BENCH">) => void;
  playerPosInInning: (name: string, inn: number) => string;
  notify: (x: string) => void;
}) {
  return (
    <>
      <div className="stats">
        <Stat n={totals.total} label="TOTAL ROSTER" sub="Synced with Roster Tab" />
        <Stat n={totals.active} label="ACTIVE PRESENT" sub="Ready for Diamond" />
        <Stat
          n={totals.out}
          label="ABSENT / OUT"
          sub="Scratched Today"
          danger
        />
        <Stat
          n={`${totals.battery}`}
          label="BATTERY (P / C)"
          sub="Available Arms"
        />
        <Stat n={totals.infield} label="INFIELD DEPTH" sub="1B, 2B, SS, 3B" />
        <Stat n={totals.outfield} label="OUTFIELD DEPTH" sub="LF, CF, RF" />
      </div>
      <div className="filterrow">
        <input placeholder="Search player by name..." />
        <div className="filters">
          <Pill tone="dark">ALL</Pill>
          <Pill>BATTERY</Pill>
          <Pill>INFIELD</Pill>
          <Pill>OUTFIELD</Pill>
        </div>
        <Btn onClick={() => notify("Data table view selected")}>▦ Data Table</Btn>
        <Btn onClick={() => notify("Added new player")} kind="green">
          + Add Player
        </Btn>
      </div>
      <Section
        title="Player Cards & Roster"
        sub="Position eligibility is coach-controlled. Click a pill to toggle Yes/No. Status ACTIVE/OUT feeds lineup & diamond."
        action={
          <div>
            <Pill>Synced with Roster Tab</Pill> <Pill>Ready for Diamond</Pill>
          </div>
        }
      >
        <div className="playergrid">
          {players.map((p) => (
            <div
              className={`player-card ${p.status === "OUT" ? "out" : ""}`}
              key={p.id}
            >
              <div className="player-top">
                <span className="number">{p.number}</span>
                <div>
                  <b>{p.name}</b>
                  <div className="tiny">
                    {p.eligible.length} of 9 Positions Eligible
                  </div>
                </div>
                <button
                  className={`status ${p.status === "ACTIVE" ? "active" : "out"}`}
                  onClick={() => toggleStatus(p.id)}
                >
                  {p.status}
                </button>
              </div>
              <div className="rotation-mini">
                <span>6-Inning Game Rotation:</span>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className="pill"
                      style={{ fontSize: 10, padding: "2px 6px" }}
                    >
                      i{i + 1} {playerPosInInning(p.name, i)}
                    </span>
                  ))}
                </div>
                <b>Inn 1: {playerPosInInning(p.name, 0)}</b>
              </div>
              <div className="posgrid">
                {POS.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => togglePos(p.id, pos)}
                    className={p.eligible.includes(pos) ? "yes" : "no"}
                    style={
                      { "--pc": POS_COLORS[pos] } as React.CSSProperties
                    }
                  >
                    {pos} {p.eligible.includes(pos) ? "✓" : "×"}
                  </button>
                ))}
              </div>
              <div className="tiny">
                {p.eligible.length} / 9 Positions Eligible
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function Stat({
  n,
  label,
  sub,
  danger
}: {
  n: any;
  label: string;
  sub: string;
  danger?: boolean;
}) {
  return (
    <div className={`stat ${danger ? "danger" : ""}`}>
      <b>{n}</b>
      <span>{label}</span>
      <small>{sub}</small>
    </div>
  );
}

function Rotation({
  players,
  rotation,
  setRotPlayer,
  warnings,
  autoBalance,
  autoSubAbsent,
  innings,
  setInnings,
  playerAt
}: {
  players: Player[];
  rotation: Record<number, Record<string, string>>;
  setRotPlayer: (inn: number, pos: string, name: string) => void;
  warnings: string[];
  autoBalance: () => void;
  autoSubAbsent: () => void;
  innings: number;
  setInnings: (n: number) => void;
  playerAt: (inn: number, pos: string) => string;
}) {
  const names = players.map((p) => p.name);
  return (
    <Section
      title="Defensive Rotation Management (6 Innings)"
      sub="Balance defensive playing time. Assign players per position per inning. Roster ACTIVE/OUT drives validation."
      action={
        <div style={{ display: "flex", gap: 8 }}>
          <Btn kind="purple" onClick={autoBalance}>
            Auto-Balance
          </Btn>
          <Btn onClick={autoSubAbsent}>Auto-Sub Absent</Btn>
        </div>
      }
    >
      {warnings.length > 0 && (
        <div
          style={{
            background: "#fff1f1",
            border: "1px solid #f1c7c7",
            borderRadius: 12,
            padding: 14,
            marginBottom: 16
          }}
        >
          <b style={{ color: "#8f3030" }}>
            Attendance / Eligibility Alerts ({warnings.length})
          </b>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: "#8f3030" }}>
            {warnings.slice(0, 8).map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
          <Btn kind="dark" onClick={autoSubAbsent}>
            Auto-Sub Absent Players with Bench
          </Btn>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table className="report">
          <thead>
            <tr>
              <th>DEFENSIVE POSITION</th>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <th key={i}>INNING {i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {POS.map((pos) => (
              <tr key={pos}>
                <td>
                  <Pill
                    tone={
                      pos === "P" || pos === "C"
                        ? "purple"
                        : ["LF", "CF", "RF"].includes(pos)
                          ? "green"
                          : "green"
                    }
                  >
                    {pos}
                  </Pill>{" "}
                  {pos === "P"
                    ? "Pitcher"
                    : pos === "C"
                      ? "Catcher"
                      : pos === "1B"
                        ? "First Base"
                        : pos === "2B"
                          ? "Second Base"
                          : pos === "3B"
                            ? "Third Base"
                            : pos === "SS"
                              ? "Shortstop"
                              : pos === "LF"
                                ? "Left Field"
                                : pos === "CF"
                                  ? "Center Field"
                                  : "Right Field"}
                </td>
                {[0, 1, 2, 3, 4, 5].map((inn) => {
                  const name = playerAt(inn, pos);
                  const pl = players.find((p) => p.name === name);
                  const bad =
                    pl &&
                    (pl.status === "OUT" || !pl.eligible.includes(pos));
                  return (
                    <td key={inn}>
                      <select
                        value={name}
                        onChange={(e) =>
                          setRotPlayer(inn, pos, e.target.value)
                        }
                        style={{
                          borderColor: bad ? "#b84242" : undefined,
                          background: bad ? "#fff1f1" : undefined
                        }}
                      >
                        <option value="">— Select —</option>
                        {names.map((n) => (
                          <option key={n} value={n}>
                            {n}
                            {players.find((p) => p.name === n)?.status === "OUT"
                              ? " (OUT)"
                              : ""}
                          </option>
                        ))}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ marginTop: 24 }}>Player × Inning Matrix</h3>
      <div style={{ overflowX: "auto" }}>
        <table className="report">
          <thead>
            <tr>
              <th>PLAYER</th>
              <th>#</th>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <th key={i}>INN {i + 1}</th>
              ))}
              <th>FIELD</th>
              <th>BENCH</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => {
              let field = 0;
              const cells = [0, 1, 2, 3, 4, 5].map((inn) => {
                let pos = "BENCH";
                for (const x of POS) {
                  if (playerAt(inn, x) === p.name) {
                    pos = x;
                    field++;
                    break;
                  }
                }
                return pos;
              });
              return (
                <tr
                  key={p.id}
                  style={
                    p.status === "OUT" ? { opacity: 0.55 } : undefined
                  }
                >
                  <td>
                    {p.name}{" "}
                    {p.status === "OUT" && <Pill tone="red">OUT</Pill>}
                  </td>
                  <td>#{p.number}</td>
                  {cells.map((pos, i) => (
                    <td key={i}>
                      <select
                        value={pos}
                        onChange={(e) => {
                          const newPos = e.target.value;
                          // clear this player from this inning first
                          POS.forEach((x) => {
                            if (playerAt(i, x) === p.name)
                              setRotPlayer(i, x, "");
                          });
                          if (newPos !== "BENCH") {
                            setRotPlayer(i, newPos, p.name);
                          }
                        }}
                      >
                        <option value="BENCH">(Bench)</option>
                        {POS.map((x) => (
                          <option key={x} value={x}>
                            {x}
                            {!p.eligible.includes(x) ? " (Inelig)" : ""}
                          </option>
                        ))}
                      </select>
                    </td>
                  ))}
                  <td>{field}</td>
                  <td>{6 - field}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function Diamond({
  players,
  rotation,
  setRotPlayer,
  diamondInn,
  setDiamondInn,
  playerAt,
  setView
}: {
  players: Player[];
  rotation: Record<number, Record<string, string>>;
  setRotPlayer: (inn: number, pos: string, name: string) => void;
  diamondInn: number;
  setDiamondInn: (n: number) => void;
  playerAt: (inn: number, pos: string) => string;
  setView: (v: string) => void;
}) {
  const names = players.map((p) => p.name);
  const spots: { pos: Exclude<Pos, "BENCH">; top: string; left: string }[] = [
    { pos: "CF", top: "8%", left: "50%" },
    { pos: "LF", top: "28%", left: "18%" },
    { pos: "RF", top: "28%", left: "82%" },
    { pos: "SS", top: "48%", left: "32%" },
    { pos: "2B", top: "48%", left: "68%" },
    { pos: "3B", top: "68%", left: "22%" },
    { pos: "1B", top: "68%", left: "78%" },
    { pos: "P", top: "62%", left: "50%" },
    { pos: "C", top: "88%", left: "50%" }
  ];

  return (
    <Section
      title={`Interactive Defensive Diamond — Inning ${diamondInn + 1}/6`}
      sub="Tap any position to assign a player from the roster. Assignments sync with the rotation matrix."
      action={
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Btn
              key={i}
              kind={diamondInn === i ? "green" : "light"}
              onClick={() => setDiamondInn(i)}
            >
              Inn {i + 1}
            </Btn>
          ))}
        </div>
      }
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 24
        }}
      >
        <div
          style={{
            position: "relative",
            background:
              "linear-gradient(180deg,#1a5c3a 0%,#0d3d24 100%)",
            borderRadius: 16,
            minHeight: 420,
            border: "3px solid #0a2e1a"
          }}
        >
          {spots.map(({ pos, top, left }) => {
            const name = playerAt(diamondInn, pos);
            const pl = players.find((p) => p.name === name);
            return (
              <div
                key={pos}
                style={{
                  position: "absolute",
                  top,
                  left,
                  transform: "translate(-50%,-50%)",
                  background: "#fff",
                  borderRadius: 10,
                  padding: "6px 10px",
                  minWidth: 90,
                  textAlign: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,.25)",
                  border:
                    pl?.status === "OUT"
                      ? "2px solid #b84242"
                      : "1px solid #e2e8f0"
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: POS_COLORS[pos]
                  }}
                >
                  {pos}
                </div>
                <select
                  value={name}
                  onChange={(e) =>
                    setRotPlayer(diamondInn, pos, e.target.value)
                  }
                  style={{
                    border: 0,
                    fontWeight: 700,
                    fontSize: 12,
                    width: "100%",
                    background: "transparent",
                    cursor: "pointer"
                  }}
                >
                  <option value="">—</option>
                  {names.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        <div>
          <h3>Inning {diamondInn + 1} Defensive Nine</h3>
          {POS.map((pos, idx) => {
            const name = playerAt(diamondInn, pos);
            const pl = players.find((p) => p.name === name);
            return (
              <div
                key={pos}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 0",
                  borderBottom: "1px solid #e2e8f0"
                }}
              >
                <span style={{ width: 24, color: "#64748b" }}>
                  {idx + 1}.
                </span>
                <Pill>{pos}</Pill>
                <select
                  value={name}
                  onChange={(e) =>
                    setRotPlayer(diamondInn, pos, e.target.value)
                  }
                  style={{ flex: 1 }}
                >
                  <option value="">— Select player —</option>
                  {names.map((n) => (
                    <option key={n} value={n}>
                      {n}
                      {players.find((p) => p.name === n)?.status === "OUT"
                        ? " (OUT)"
                        : ""}
                    </option>
                  ))}
                </select>
                {pl?.status === "OUT" && <Pill tone="red">OUT</Pill>}
              </div>
            );
          })}
          <div style={{ marginTop: 16 }}>
            <Btn kind="green" onClick={() => setView("print")}>
              Open Print Lineup Card →
            </Btn>
          </div>
        </div>
      </div>
    </Section>
  );
}

function PrintCard({
  team,
  batting,
  rotation,
  players,
  swapBat,
  setBatting,
  onPrint
}: {
  team: string;
  batting: string[];
  rotation: Record<number, Record<string, string>>;
  players: Player[];
  swapBat: (i: number, dir: number) => void;
  setBatting: (b: string[]) => void;
  onPrint: () => void;
}) {
  const names = players.map((p) => p.name);
  return (
    <Section
      title="OFFICIAL DUGOUT LINEUP CARD"
      sub="6-Inning Defensive Rotation · Batting order driven by roster"
      action={
        <div style={{ display: "flex", gap: 8 }}>
          <Btn
            onClick={() => {
              const shuffled = [...batting].sort(() => Math.random() - 0.5);
              setBatting(shuffled);
            }}
          >
            Randomize
          </Btn>
          <Btn
            onClick={() =>
              setBatting(
                buildDefaultBatting(players)
              )
            }
          >
            Reset Order
          </Btn>
          <Btn kind="green" onClick={onPrint}>
            Print Card
          </Btn>
        </div>
      }
    >
      <div className="print-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12
          }}
        >
          <div>
            <Pill tone="dark">OFFICIAL DUGOUT LINEUP CARD</Pill>
            <h2 style={{ margin: "8px 0" }}>GAME 1 VS EAGLES</h2>
            <p style={{ color: "#64748b", margin: 0 }}>{team}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Pill>OPPONENT: Eagles</Pill>
            <Pill>DATE: 2025-04-12</Pill>
            <Pill>HOME</Pill>
            <Pill>{players.length} Players</Pill>
          </div>
        </div>

        <h3>OFFICIAL BATTING ORDER (1 THROUGH 12)</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 10
          }}
        >
          {batting.map((name, i) => {
            const pl = players.find((p) => p.name === name);
            return (
              <div
                key={i}
                style={{
                  border:
                    pl?.status === "OUT"
                      ? "2px solid #b84242"
                      : "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: 10,
                  background: pl?.status === "OUT" ? "#fff1f1" : "#fff"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <b>
                    {i + 1}. #{pl?.number ?? "—"} {name}
                    {pl?.status === "OUT" ? " (Absent)" : ""}
                  </b>
                  <span>
                    <button className="textbtn" onClick={() => swapBat(i, -1)}>
                      ↑
                    </button>
                    <button className="textbtn" onClick={() => swapBat(i, 1)}>
                      ↓
                    </button>
                  </span>
                </div>
                <select
                  value={name}
                  onChange={(e) => {
                    const b = [...batting];
                    b[i] = e.target.value;
                    setBatting(b);
                  }}
                  style={{ width: "100%", marginTop: 6 }}
                >
                  {names.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        <h3 style={{ marginTop: 24 }}>Defensive Positions by Inning</h3>
        <table className="report">
          <thead>
            <tr>
              <th>POSITION</th>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <th key={i}>INNING {i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {POS.map((pos) => (
              <tr key={pos}>
                <td>
                  {pos}
                </td>
                {[0, 1, 2, 3, 4, 5].map((inn) => (
                  <td key={inn}>{rotation[inn]?.[pos] || "—"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function Pitch({
  players,
  max,
  setMax
}: {
  players: Player[];
  max: number;
  setMax: (n: number) => void;
}) {
  const arms = players.filter(
    (p) => p.eligible.includes("P") || p.pitches > 0
  );
  return (
    <Section
      title="Pitch Smart & Rules"
      sub="Little League daily max + tournament multi-game arm budget"
      action={
        <div>
          Daily max:{" "}
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(Number(e.target.value) || 85)}
            style={{ width: 64 }}
          />
        </div>
      }
    >
      <table className="report">
        <thead>
          <tr>
            <th>PITCHER</th>
            <th>PITCHES USED</th>
            <th>REMAINING</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {arms.map((p) => (
            <tr key={p.id}>
              <td>
                #{p.number} {p.name}
              </td>
              <td>{p.pitches}</td>
              <td>{Math.max(0, max - p.pitches)}</td>
              <td>
                <Pill tone={p.pitches >= max ? "red" : "green"}>
                  {p.pitches >= max ? "Maxed" : "Eligible"}
                </Pill>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 style={{ marginTop: 20 }}>
        Tournament Weekend Multi-Game Arm Budget
      </h3>
      <table className="report">
        <thead>
          <tr>
            <th>PITCHER</th>
            <th>SAT POOL #1</th>
            <th>SAT POOL #2</th>
            <th>SUN SEMIS</th>
            <th>SUN FINAL</th>
            <th>TOTAL</th>
            <th>REMAINING (95)</th>
          </tr>
        </thead>
        <tbody>
          {arms.slice(0, 4).map((p) => {
            const total = p.pitches + Math.floor(p.pitches * 0.4);
            return (
              <tr key={p.id}>
                <td>
                  #{p.number} {p.name}
                </td>
                <td>{p.pitches}</td>
                <td>0</td>
                <td>{Math.floor(p.pitches * 0.3)}</td>
                <td>0</td>
                <td>{total}</td>
                <td>
                  <Pill tone="green">{95 - total} Left</Pill>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Section>
  );
}

function Practice({
  practice,
  setPractice,
  notify
}: {
  practice: { duration: number; field: string; focus: string };
  setPractice: (p: any) => void;
  notify: (s: string) => void;
}) {
  const drills = [
    {
      name: "Dynamic Warmup & Throwing Progression",
      cat: "WARMUP",
      min: 15
    },
    {
      name: "Everyday Fielding (Infield 4-Corners)",
      cat: "INFIELD",
      min: 15
    },
    {
      name: "Drop Step & Angle Route Tracking",
      cat: "OUTFIELD",
      min: 15
    },
    { name: "Live BP / Situational Hitting", cat: "HITTING", min: 20 }
  ];
  return (
    <Section
      title="Practice Planner & Drill Library"
      sub="Build minute-by-minute practice itineraries from the preloaded catalog"
      action={
        <Btn kind="green" onClick={() => notify("Practice card printed")}>
          Print Practice Card
        </Btn>
      }
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
          marginBottom: 16
        }}
      >
        <label>
          Session title
          <input
            value={`Pre-Tournament ${practice.focus}`}
            readOnly
            style={{ width: "100%" }}
          />
        </label>
        <label>
          Duration (min)
          <input
            type="number"
            value={practice.duration}
            onChange={(e) =>
              setPractice({
                ...practice,
                duration: Number(e.target.value) || 90
              })
            }
            style={{ width: "100%" }}
          />
        </label>
        <label>
          Field
          <input
            value={practice.field}
            onChange={(e) =>
              setPractice({ ...practice, field: e.target.value })
            }
            style={{ width: "100%" }}
          />
        </label>
      </div>
      <h3>Today&apos;s Practice Schedule</h3>
      {drills.map((d, i) => (
        <div
          key={d.name}
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: 12,
            marginBottom: 8
          }}
        >
          <b>
            {i + 1}. {d.name}
          </b>{" "}
          <Pill>{d.cat}</Pill> <Pill tone="green">{d.min} min</Pill>
        </div>
      ))}
    </Section>
  );
}

function Umpire({
  team,
  batting,
  rotation,
  players
}: {
  team: string;
  batting: string[];
  rotation: Record<number, Record<string, string>>;
  players: Player[];
}) {
  return (
    <Section
      title="Official Umpire Lineup Card (Exchange Copy)"
      sub={`${team} vs Eagles · Little League rules · Daily cap 85 pitches`}
    >
      <table className="report">
        <thead>
          <tr>
            <th>#</th>
            <th>JERSEY</th>
            <th>PLAYER</th>
            <th>START POS</th>
          </tr>
        </thead>
        <tbody>
          {batting.map((name, i) => {
            const pl = players.find((p) => p.name === name);
            let start = "—";
            for (const pos of POS) {
              if (rotation[0]?.[pos] === name) {
                start = pos;
                break;
              }
            }
            return (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>#{pl?.number ?? "—"}</td>
                <td>{name}</td>
                <td>{start}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Section>
  );
}

function Equity({ players }: { players: Player[] }) {
  return (
    <Section
      title="Defensive Inning Equity Report"
      sub="Certified fair-play roster · Zero parent playing-time disputes"
    >
      <table className="report">
        <thead>
          <tr>
            <th>PLAYER</th>
            <th>TOTAL INNINGS</th>
            <th>BENCH</th>
            <th>EQUITY GRADE</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => {
            const d = p.innings - 18;
            return (
              <tr key={p.id}>
                <td>
                  #{p.number} {p.name}
                </td>
                <td>
                  {p.innings} Inn ({Math.round((p.innings / 24) * 100)}%)
                </td>
                <td>{p.bench}</td>
                <td>
                  <Pill tone={Math.abs(d) <= 4 ? "green" : "yellow"}>
                    {Math.abs(d) <= 4 ? "A+" : "B"}
                  </Pill>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Section>
  );
}

function Org({
  orgTab,
  setOrgTab,
  notify,
  orgName,
  setOrgName,
  league,
  setLeague,
  teams,
  renameTeamById,
  switchActiveTeam,
  startRename
}: {
  orgTab: string;
  setOrgTab: (x: string) => void;
  notify: (x: string) => void;
  orgName: string;
  setOrgName: (s: string) => void;
  league: string;
  setLeague: (s: string) => void;
  teams: {
    id: string;
    name: string;
    division: string;
    headCoach: string;
    diamond: string;
    games: number;
    active: boolean;
  }[];
  renameTeamById: (id: string, name: string) => void;
  switchActiveTeam: (id: string) => void;
  startRename: (kind: "org" | "league" | "team", current: string) => void;
}) {
  const [localOrg, setLocalOrg] = useState(orgName);
  const [localLeague, setLocalLeague] = useState(league);
  const [teamEdits, setTeamEdits] = useState<Record<string, string>>({});

  return (
    <Section
      title="Organization & League Admin"
      sub="Full multi-team control: rename organization/league, add/manage teams across divisions, coaches, and audit dugout operations."
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
          marginBottom: 16
        }}
      >
        <h3 style={{ margin: 0 }}>{orgName}</h3>
        <Pill tone="purple">Org Leader Console</Pill>
        <Pill tone="green">{teams.length} Teams in Organization</Pill>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: 12,
          marginBottom: 20
        }}
      >
        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: 14,
            background: "#fff"
          }}
        >
          <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>
            ORGANIZATION NAME
          </label>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <input
              value={localOrg}
              onChange={(e) => setLocalOrg(e.target.value)}
              style={{ flex: 1, padding: "8px 10px" }}
            />
            <Btn
              kind="purple"
              onClick={() => {
                const n = localOrg.trim();
                if (!n) return;
                setOrgName(n);
                notify(`Organization renamed to “${n}”`);
              }}
            >
              Save Org
            </Btn>
          </div>
        </div>
        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: 14,
            background: "#fff"
          }}
        >
          <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>
            LEAGUE NAME
          </label>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <input
              value={localLeague}
              onChange={(e) => setLocalLeague(e.target.value)}
              style={{ flex: 1, padding: "8px 10px" }}
            />
            <Btn
              kind="purple"
              onClick={() => {
                const n = localLeague.trim();
                if (!n) return;
                setLeague(n);
                notify(`League renamed to “${n}”`);
              }}
            >
              Save League
            </Btn>
          </div>
        </div>
      </div>

      <div className="orgtabs">
        {[
          ["teams", "Organizations & Teams"],
          ["requests", "Request Access Wall"],
          ["coaches", "Coaches & Assistants"],
          ["security", "Security Audit"]
        ].map(([k, l]) => (
          <button
            className={orgTab === k ? "selected" : ""}
            onClick={() => setOrgTab(k)}
            key={k}
          >
            {l}
          </button>
        ))}
      </div>

      {orgTab === "teams" && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12
            }}
          >
            <b>
              Organization Teams & Divisions ({teams.length}) — Active:{" "}
              {teams.find((t) => t.active)?.name}
            </b>
            <Btn
              kind="green"
              onClick={() =>
                notify("Add New Team — connect Supabase to persist new teams")
              }
            >
              + Add New Team
            </Btn>
          </div>
          <div className="teamcards">
            {teams.map((t) => {
              const draft = teamEdits[t.id] ?? t.name;
              return (
                <div
                  className="team-admin"
                  key={t.id}
                  style={
                    t.active
                      ? { outline: "2px solid #1d8b63", outlineOffset: 2 }
                      : undefined
                  }
                >
                  {t.active ? (
                    <Pill tone="green">ACTIVE</Pill>
                  ) : (
                    <Pill>INACTIVE</Pill>
                  )}
                  <Pill>{t.division}</Pill>
                  <div style={{ marginTop: 10 }}>
                    <label
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#64748b"
                      }}
                    >
                      TEAM NAME
                    </label>
                    <input
                      value={draft}
                      onChange={(e) =>
                        setTeamEdits((m) => ({
                          ...m,
                          [t.id]: e.target.value
                        }))
                      }
                      style={{
                        width: "100%",
                        marginTop: 4,
                        padding: "8px 10px",
                        fontWeight: 700
                      }}
                    />
                  </div>
                  <p style={{ margin: "10px 0 4px" }}>
                    Head Coach: <b>{t.headCoach}</b>
                  </p>
                  <p style={{ margin: "0 0 4px", color: "#64748b" }}>
                    Diamond: {t.diamond}
                  </p>
                  <p style={{ margin: "0 0 12px", color: "#64748b" }}>
                    Scheduled Games: {t.games}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <Btn
                      kind="purple"
                      onClick={() => {
                        renameTeamById(t.id, draft);
                        setTeamEdits((m) => {
                          const n = { ...m };
                          delete n[t.id];
                          return n;
                        });
                      }}
                    >
                      ✎ Save Team Name
                    </Btn>
                    {!t.active && (
                      <Btn kind="green" onClick={() => switchActiveTeam(t.id)}>
                        Make Active
                      </Btn>
                    )}
                    {t.active && (
                      <Btn
                        kind="green"
                        onClick={() => startRename("team", t.name)}
                      >
                        Edit in Header
                      </Btn>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {orgTab === "requests" && (
        <div className="request-grid">
          {[
            {
              name: "Dave Miller",
              email: "dave.miller@metrobaseball.org",
              note: "Need 6-inning rotation system for 10U & 12U tournament teams."
            },
            {
              name: "Sarah Jenkins",
              email: "sjenkins@wildcatsports.com",
              note: "Requesting dugout assistant access to record attendance and monitor bullpen."
            }
          ].map((x) => (
            <div className="request" key={x.name}>
              <b>{x.name}</b>
              <p>{x.email}</p>
              <p>{x.note}</p>
              <Btn kind="green" onClick={() => notify(`${x.name} approved`)}>
                Approve & Add Coach
              </Btn>
            </div>
          ))}
        </div>
      )}

      {orgTab === "coaches" && (
        <table className="report">
          <thead>
            <tr>
              <th>COACH</th>
              <th>EMAIL</th>
              <th>TEAM</th>
              <th>ROLE</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Mike Cassidy", "Organization Leader"],
              ["Dave Miller", "Head Coach"],
              ["Assistant 1", "Assistant Coach"],
              ["Assistant 2", "Assistant Coach"]
            ].map(([x, role]) => (
              <tr key={x}>
                <td>{x}</td>
                <td>
                  {x.toLowerCase().replaceAll(" ", ".")}@example.com
                </td>
                <td>{teams.find((t) => t.active)?.name || teams[0]?.name}</td>
                <td>
                  <Pill tone="green">{role}</Pill>
                </td>
                <td>
                  <Btn>Edit</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {orgTab === "security" && <Audit />}
    </Section>
  );
}

function Audit() {
  return (
    <div className="audit">
      <div className="auditcards">
        <Stat n="12" label="ORGANIZATION MEMBERS" sub="Current access" />
        <Stat n="4" label="ACTIVE COACHES" sub="Across 3 teams" />
        <Stat n="0" label="SECURITY ALERTS" sub="Last 30 days" />
      </div>
      {[
        "Mike Cassidy approved Coach Alex Johnson",
        "Mike Cassidy changed League Settings",
        "Assistant 1 marked Charles #24 as Absent",
        "Assistant 2 checked defensive lineup"
      ].map((x, i) => (
        <div className="auditrow" key={x}>
          <span>
            2026-05-0{i + 1} 10:4{i}
          </span>
          <b>{x}</b>
          <Pill tone="green">Logged</Pill>
        </div>
      ))}
    </div>
  );
}
