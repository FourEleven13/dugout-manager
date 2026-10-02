import { useState } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? "/app";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/app" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setSubmitting(true);
    try { await login(email.trim(), password); navigate(from, { replace: true }); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Login failed"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="dm-auth-page">
      <div className="dm-auth-shell">
        <Link to="/" className="dm-brand dm-auth-brand"><span className="dm-brand-mark">⚾</span><span>Dugout Manager</span></Link>
        <div className="dm-auth-card">
          <h1>Welcome back</h1>
          <p>Pick up where you left off with your team and game plan.</p>
          <form onSubmit={handleSubmit}>
            <label className="dm-auth-label" htmlFor="email">Email</label>
            <input className="dm-auth-input" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            <label className="dm-auth-label" htmlFor="password">Password</label>
            <input className="dm-auth-input" id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
            <div style={{ textAlign: "right", marginTop: 7 }}><Link className="dm-auth-link" to="/forgot-password">Forgot password?</Link></div>
            {error && <p className="dm-auth-error">{error}</p>}
            <button className="dm-auth-submit" type="submit" disabled={submitting}>{submitting ? "Signing in…" : "Sign in"}</button>
          </form>
          <p style={{ textAlign: "center", marginBottom: 0 }}>New coach? <Link className="dm-auth-link" to="/signup">Create a free account</Link></p>
        </div>
        <div className="dm-auth-footer">Pairs with GameChanger · Built for the planning side of coaching</div>
      </div>
    </div>
  );
}
