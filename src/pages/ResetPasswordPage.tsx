import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function ResetPasswordPage() {
  const { updatePassword, isCloud } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setMessage(null);
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setSubmitting(true);
    try { await updatePassword(password); setMessage("Password updated. Taking you to your dugout..."); setTimeout(() => navigate("/app", { replace: true }), 900); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Could not update password."); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="dm-auth-page">
      <div className="dm-auth-shell">
        <Link to="/" className="dm-brand dm-auth-brand"><span className="dm-brand-mark">⚾</span><span>Dugout Manager</span></Link>
        <div className="dm-auth-card">
          <h1>Choose a new password</h1>
          <p>Use a password you'll remember on game day, but nobody else can guess.</p>
          <form onSubmit={handleSubmit}>
            <label className="dm-auth-label" htmlFor="password">New password</label>
            <input className="dm-auth-input" id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
            <label className="dm-auth-label" htmlFor="confirm">Confirm password</label>
            <input className="dm-auth-input" id="confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={6} autoComplete="new-password" />
            {error && <p className="dm-auth-error">{error}</p>}
            {message && <p style={{ background: "#edf8f1", border: "1px solid #c9e5d2", color: "#195c3d", padding: 11, borderRadius: 10, fontSize: 14 }}>{message}</p>}
            <button className="dm-auth-submit" type="submit" disabled={submitting}>{submitting ? "Updating…" : "Update password"}</button>
          </form>
          {!isCloud && <p style={{ fontSize: 13 }}>Local demo accounts can update their password when signed in. Cloud reset links require Supabase.</p>}
        </div>
      </div>
    </div>
  );
}
