import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function ForgotPasswordPage() {
  const { resetPassword, isCloud } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setMessage(null); setSubmitting(true);
    try {
      await resetPassword(email.trim());
      setMessage("Check your email for a password reset link. It will return you to Dugout Manager to choose a new password.");
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Could not send the reset email."); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="dm-auth-page">
      <div className="dm-auth-shell">
        <Link to="/" className="dm-brand dm-auth-brand"><span className="dm-brand-mark">⚾</span><span>Dugout Manager</span></Link>
        <div className="dm-auth-card">
          <h1>Reset your password</h1>
          <p>Enter the email on your coach account and we'll send you a secure reset link.</p>
          {!isCloud && <p className="dm-auth-error">Cloud authentication is not connected in this build. Password reset requires Supabase.</p>}
          <form onSubmit={handleSubmit}>
            <label className="dm-auth-label" htmlFor="email">Email</label>
            <input className="dm-auth-input" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="you@email.com" />
            {error && <p className="dm-auth-error">{error}</p>}
            {message && <p style={{ background: "#edf8f1", border: "1px solid #c9e5d2", color: "#195c3d", padding: 11, borderRadius: 10, fontSize: 14 }}>{message}</p>}
            <button className="dm-auth-submit" type="submit" disabled={submitting || !isCloud}>{submitting ? "Sending…" : "Send reset link"}</button>
          </form>
          <p style={{ textAlign: "center", marginBottom: 0 }}><Link className="dm-auth-link" to="/login">Back to sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
