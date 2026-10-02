import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../styles/app.css";

const DEMO_COACHES = [
  {
    name: "Mike Cassidy (Org Owner & Head Coach)",
    email: "cassidymichael20@yahoo.com",
    role: "Organization Leader",
    tone: "purple" as const
  },
  {
    name: "Mike Cassidy (Head Coach)",
    email: "cassidymichael20@yahoo.com",
    role: "Head Coach",
    tone: "green" as const
  },
  {
    name: "Assistant 1",
    email: "assistant1@thunderbirds.team",
    role: "Assistant Coach",
    tone: "green" as const
  },
  {
    name: "Assistant 2",
    email: "assistant2@thunderbirds.team",
    role: "Assistant Coach",
    tone: "green" as const
  },
  {
    name: "Dave Miller (Wildcats Head Coach)",
    email: "dave.miller@metrobaseball.org",
    role: "Head Coach",
    tone: "green" as const
  }
];

function Pill({
  children,
  tone = "green"
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={`pill ${tone}`}>{children}</span>;
}

export function LandingPage() {
  const { demoLogin } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = React.useState<string | null>(null);

  const handleRoleLogin = async (email: string, role: string) => {
    setBusy(email + role);
    try {
      await demoLogin(email, role);
      navigate("/app", { replace: true });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="hero-page">
      <header className="hero-nav">
        <div className="hero-brand">
          ⚾ <b>Dugout Manager</b> <Pill tone="green">PRO</Pill>
        </div>
        <nav>
          <a href="#why">Why Not GameChanger?</a>
          <a href="#features">6-Inning Rotations</a>
          <a href="#features">Leagues & Org Leaders</a>
          <a href="#features">Pricing</a>
        </nav>
        <div className="hero-actions">
          <Link to="/signup">Request Access</Link>
          <Link to="/login">Coach Login</Link>
          <Link className="hero-cta" to="/signup">
            Demo
          </Link>
          <button
            className="hero-cta"
            style={{
              border: 0,
              cursor: "pointer",
              background: "#1d8b63",
              color: "#fff",
              borderRadius: 7,
              padding: "8px 11px",
              fontWeight: 800,
              fontSize: 12
            }}
            onClick={() =>
              handleRoleLogin(
                "cassidymichael20@yahoo.com",
                "Organization Leader"
              )
            }
          >
            Launch →
          </button>
        </div>
      </header>

      <main className="hero-main">
        <div className="hero-copy">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <Pill tone="green">MOBILE-FIRST DUGOUT NATIVE</Pill>
            <Pill>Dugout Pocket-Lock (No Accidental Taps)</Pill>
            <Pill>1-Click Clipboard Lineup Card</Pill>
          </div>
          <Pill tone="purple">The #1 Dugout Tool GameChanger Doesn&apos;t Do</Pill>
          <h1>
            Stop Scribbling Lineups
            <br />
            on Dirt. Win the
            <br />
            <span>Dugout.</span>
          </h1>
          <p>
            GameChanger is great for live scoring and live-streaming. But it{" "}
            <b>doesn&apos;t balance your 6-inning defensive positions</b>, guarantee
            fair infield/outfield playing time, print official clipboard cards, or
            lock against accidental dugout taps. Dugout Manager is the
            purpose-built secret weapon youth baseball coaches have been waiting
            for.
          </p>
          <div className="hero-buttons">
            <button
              onClick={() =>
                handleRoleLogin(
                  "cassidymichael20@yahoo.com",
                  "Organization Leader"
                )
              }
              style={{
                background: "#1d8b63",
                color: "#fff",
                border: 0,
                padding: "11px 15px",
                borderRadius: 8,
                fontWeight: 800,
                fontSize: 12,
                cursor: "pointer"
              }}
            >
              Launch Dugout →
            </button>
            <a href="#features">See How It Works ↓</a>
          </div>
        </div>

        <div className="hero-portal" id="login">
          <div className="portal-head">
            <b>→ Coach & League Portal</b>
            <Pill tone="green">INSTANT ACCESS</Pill>
          </div>
          <p style={{ color: "#9fb2bd", fontSize: 12, margin: "0 0 8px" }}>
            Choose an authenticated account role below or sign in to enter your
            dugout:
          </p>
          <small>INSTANT 1-CLICK ROLE LOGIN:</small>
          {DEMO_COACHES.map((c) => (
            <button
              key={c.name + c.role}
              className="portal-user"
              type="button"
              disabled={busy !== null}
              onClick={() => handleRoleLogin(c.email, c.role)}
              style={{
                width: "100%",
                background: "transparent",
                border: 0,
                borderBottom: "1px solid #ffffff0e",
                cursor: "pointer",
                textAlign: "left"
              }}
            >
              <span>
                <b style={{ display: "block", color: "#e2ebef" }}>{c.name}</b>
                <span style={{ color: "#78909e", fontSize: 10 }}>{c.email}</span>
              </span>
              <Pill tone={c.tone}>
                {busy === c.email + c.role ? "Signing in…" : c.role} ›
              </Pill>
            </button>
          ))}
          <div style={{ marginTop: 14, textAlign: "center" }}>
            <Link
              to="/login"
              style={{ color: "#5fd39d", fontSize: 12, fontWeight: 700 }}
            >
              Or use email / password login →
            </Link>
          </div>
        </div>
      </main>

      <section id="features" className="hero-features">
        <div>
          <b>01</b>
          <h3>Fair Lineups</h3>
          <p>Track innings, positions and bench time with equity grades.</p>
        </div>
        <div>
          <b>02</b>
          <h3>Defensive Rotations</h3>
          <p>Build six-inning plans without the spreadsheet shuffle.</p>
        </div>
        <div>
          <b>03</b>
          <h3>Pitch Smart</h3>
          <p>Keep pitch limits, rest days and tournament budgets visible.</p>
        </div>
        <div>
          <b>04</b>
          <h3>Practice Plans</h3>
          <p>Use preloaded drills to build a timed practice card.</p>
        </div>
        <div>
          <b>05</b>
          <h3>Print & Umpire Cards</h3>
          <p>Official lineup, defensive matrix and plate exchange copies.</p>
        </div>
      </section>
    </div>
  );
}
