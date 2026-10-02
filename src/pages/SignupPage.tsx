import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function SignupPage() {
  const { signup, user, loading, isCloud } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null); const [submitting, setSubmitting] = useState(false);
  if (!loading && user) return <Navigate to="/app" replace />;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setSubmitting(true);
    try { await signup(email.trim(), password); navigate("/app/roster", { replace: true }); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Signup failed"); }
    finally { setSubmitting(false); }
  };
  return (
    <div className="dm-auth-page">
      <div className="dm-auth-shell">
        <Link to="/" className="dm-brand dm-auth-brand"><span className="dm-brand-mark">⚾</span><span>Dugout Manager</span></Link>
        <div className="dm-auth-card">
          <h1>Build your coaching workspace</h1>
          <p>Start with your roster. Then turn it into lineups, rotations, and practices.</p>
          <form onSubmit={handleSubmit}>
            <label className="dm-auth-label" htmlFor="email">Email</label>
            <input className="dm-auth-input" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="you@email.com" />
            <label className="dm-auth-label" htmlFor="password">Password</label>
            <input className="dm-auth-input" id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" placeholder="At least 6 characters" />
            {error && <p className="dm-auth-error">{error}</p>}
            <button className="dm-auth-submit" type="submit" disabled={submitting}>{submitting ? "Creating account…" : "Create free account"}</button>
          </form>
          {!isCloud && <p style={{ fontSize: 13, marginBottom: 0 }}>Demo mode is running locally. Connect Supabase for cloud accounts and multi-device sync.</p>}
          <p style={{ textAlign: "center", marginBottom: 0 }}>Already have an account? <Link className="dm-auth-link" to="/login">Log in</Link></p>
        </div>
        <div className="dm-auth-footer">No scoring or streaming replacement. Just the coach's planning side.</div>
      </div>
    </div>
  );
}
