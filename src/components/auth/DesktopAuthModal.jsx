import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useMukt } from "../../context/MuktContext";

export function DesktopAuthModal({ initialMode = "signin", onClose }) {
  const { signIn, signUp, signInWithMagicLink, resetPassword } = useAuth();
  const { showToast, updateSettings } = useMukt();

  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email address");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        if (!password) {
          setErrorMessage("Please enter your password");
          setIsSubmitting(false);
          return;
        }
        const res = await signIn(email, password);
        if (res.success) {
          updateSettings({ onboarded: true }, false);
          showToast(`Welcome back, ${res.user?.user_metadata?.name || res.user?.email}!`);
          onClose?.();
        } else {
          setErrorMessage(res.error || "Invalid email or password");
        }
      } else if (mode === "signup") {
        if (!password || password.length < 6) {
          setErrorMessage("Password must be at least 6 characters");
          setIsSubmitting(false);
          return;
        }
        const res = await signUp(email, password, { name });
        if (res.success) {
          if (res.needsVerification) {
            setSuccessMessage("Account created! Check your email to confirm your account.");
          } else {
            updateSettings({ onboarded: true }, false);
            showToast("Welcome to Mukt! Your loan tracker is ready.");
            onClose?.();
          }
        } else {
          setErrorMessage(res.error || "Could not create account");
        }
      } else if (mode === "magiclink") {
        const res = await signInWithMagicLink(email);
        if (res.success) {
          setSuccessMessage("Magic sign-in link sent! Check your inbox.");
        } else {
          setErrorMessage(res.error || "Failed to send magic link");
        }
      } else if (mode === "forgot") {
        const res = await resetPassword(email);
        if (res.success) {
          setSuccessMessage("Password reset email sent! Check your inbox.");
        } else {
          setErrorMessage(res.error || "Failed to send password reset");
        }
      }
    } catch (err) {
      setErrorMessage(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.72)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "var(--bg-card-solid)",
          border: "1px solid var(--border-strong)",
          borderRadius: "22px",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.65)",
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          position: "relative",
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "var(--bg-sunken)",
            border: "1px solid var(--border-subtle)",
            display: "grid",
            placeItems: "center",
            color: "var(--text-dim)",
            transition: "all 0.15s ease",
          }}
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        {/* Brand Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "var(--accent)",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 4px 16px var(--accent-glow)",
              flexShrink: 0,
            }}
          >
            <KeyRound size={24} color="#fff" strokeWidth={2.4} />
          </div>
          <div>
            <h2
              style={{
                fontSize: "1.375rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--text-main)",
                lineHeight: 1.2,
              }}
            >
              {mode === "signin"
                ? "Welcome Back"
                : mode === "signup"
                ? "Create Account"
                : mode === "magiclink"
                ? "Passwordless Login"
                : "Reset Password"}
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-dim)", marginTop: "2px" }}>
              {mode === "signin"
                ? "Sign in to access your synchronized loan ledger"
                : mode === "signup"
                ? "Keep your education loan synced securely in the cloud"
                : mode === "magiclink"
                ? "We'll send a one-click authentication link to your email"
                : "Enter your email to receive recovery instructions"}
            </p>
          </div>
        </div>

        {/* Tab Switcher for Sign In / Sign Up */}
        {(mode === "signin" || mode === "signup") && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              backgroundColor: "var(--bg-sunken)",
              padding: "4px",
              borderRadius: "14px",
              border: "1px solid var(--border-subtle)",
              gap: "4px",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              style={{
                height: "38px",
                borderRadius: "10px",
                fontSize: "0.875rem",
                fontWeight: mode === "signin" ? 700 : 500,
                backgroundColor: mode === "signin" ? "var(--bg-card-solid)" : "transparent",
                color: mode === "signin" ? "var(--accent)" : "var(--text-dim)",
                boxShadow: mode === "signin" ? "0 2px 8px rgba(0, 0, 0, 0.25)" : "none",
                border: mode === "signin" ? "1px solid var(--border-subtle)" : "none",
                transition: "all 0.18s ease",
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              style={{
                height: "38px",
                borderRadius: "10px",
                fontSize: "0.875rem",
                fontWeight: mode === "signup" ? 700 : 500,
                backgroundColor: mode === "signup" ? "var(--bg-card-solid)" : "transparent",
                color: mode === "signup" ? "var(--accent)" : "var(--text-dim)",
                boxShadow: mode === "signup" ? "0 2px 8px rgba(0, 0, 0, 0.25)" : "none",
                border: mode === "signup" ? "1px solid var(--border-subtle)" : "none",
                transition: "all 0.18s ease",
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--danger-light)",
              color: "var(--danger)",
              fontSize: "0.8125rem",
              fontWeight: 600,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 14px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--success-light)",
              color: "var(--success)",
              fontSize: "0.875rem",
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          >
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {mode === "signup" && (
            <div>
              <label
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Your Name
              </label>
              <div style={{ position: "relative" }}>
                <User
                  size={16}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-dim)",
                  }}
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jai Doshi"
                  className="form-input"
                  style={{ paddingLeft: "40px" }}
                />
              </div>
            </div>
          )}

          <div>
            <label
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--text-dim)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={16}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-dim)",
                }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="form-input"
                style={{ paddingLeft: "40px" }}
                autoFocus
              />
            </div>
          </div>

          {(mode === "signin" || mode === "signup") && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <label
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--text-dim)",
                  }}
                >
                  Password
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setErrorMessage("");
                    }}
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--accent)",
                      fontWeight: 600,
                    }}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>

              <div style={{ position: "relative" }}>
                <Lock
                  size={16}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-dim)",
                  }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingLeft: "40px", paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-dim)",
                    padding: "4px",
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "12px 18px",
              fontSize: "0.9375rem",
              fontWeight: 800,
              marginTop: "4px",
            }}
          >
            <span>
              {isSubmitting
                ? "Processing..."
                : mode === "signin"
                ? "Sign In"
                : mode === "signup"
                ? "Create Account"
                : mode === "magiclink"
                ? "Send Magic Link"
                : "Send Reset Link"}
            </span>
            {!isSubmitting && <ArrowRight size={16} strokeWidth={2.5} />}
          </button>
        </form>

        {/* Footer options */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {mode === "signin" && (
            <button
              type="button"
              onClick={() => {
                setMode("magiclink");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              style={{
                fontSize: "0.8125rem",
                color: "var(--text-muted)",
                textAlign: "center",
                padding: "6px",
              }}
            >
              <Sparkles size={13} style={{ color: "var(--accent)", display: "inline", marginRight: "6px" }} />
              Prefer passwordless? Sign in with Magic Link
            </button>
          )}

          {(mode === "magiclink" || mode === "forgot") && (
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              style={{
                fontSize: "0.8125rem",
                color: "var(--accent)",
                textAlign: "center",
                fontWeight: 600,
                padding: "6px",
              }}
            >
              Back to Email & Password
            </button>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "12px",
              borderTop: "1px solid var(--border-subtle)",
              fontSize: "0.75rem",
              color: "var(--text-dim)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldCheck size={14} style={{ color: "var(--accent)" }} />
              <span>Encrypted via Supabase</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{ color: "var(--text-dim)", textDecoration: "underline" }}
            >
              Continue Offline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
