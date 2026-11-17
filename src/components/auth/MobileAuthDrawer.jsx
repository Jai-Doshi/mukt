import React, { useState } from "react";
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
import { triggerHaptic } from "../../utils/haptics";

export function MobileAuthDrawer({ initialMode = "signin", onClose }) {
  const { signIn, signUp, signInWithMagicLink, resetPassword } = useAuth();
  const { showToast } = useMukt();

  const [mode, setMode] = useState(initialMode); // 'signin', 'signup', 'magiclink', 'forgot'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email address");
      triggerHaptic("error");
      return;
    }

    setIsSubmitting(true);
    triggerHaptic("medium");

    try {
      if (mode === "signin") {
        if (!password) {
          setErrorMessage("Please enter your password");
          triggerHaptic("error");
          setIsSubmitting(false);
          return;
        }
        const res = await signIn(email, password);
        if (res.success) {
          triggerHaptic("success");
          showToast(`Welcome back, ${res.user?.user_metadata?.name || res.user?.email}!`);
          onClose?.();
        } else {
          triggerHaptic("error");
          setErrorMessage(res.error || "Invalid email or password");
        }
      } else if (mode === "signup") {
        if (!password || password.length < 6) {
          setErrorMessage("Password must be at least 6 characters");
          triggerHaptic("error");
          setIsSubmitting(false);
          return;
        }
        const res = await signUp(email, password, { name });
        if (res.success) {
          triggerHaptic("success");
          if (res.needsVerification) {
            setSuccessMessage("Account created! Check your email to confirm your account.");
          } else {
            showToast("Account created successfully!");
            onClose?.();
          }
        } else {
          triggerHaptic("error");
          setErrorMessage(res.error || "Could not create account");
        }
      } else if (mode === "magiclink") {
        const res = await signInWithMagicLink(email);
        if (res.success) {
          triggerHaptic("success");
          setSuccessMessage("Magic sign-in link sent! Check your inbox.");
        } else {
          triggerHaptic("error");
          setErrorMessage(res.error || "Failed to send magic link");
        }
      } else if (mode === "forgot") {
        const res = await resetPassword(email);
        if (res.success) {
          triggerHaptic("success");
          setSuccessMessage("Password reset email sent! Check your inbox.");
        } else {
          triggerHaptic("error");
          setErrorMessage(res.error || "Failed to send password reset");
        }
      }
    } catch (err) {
      triggerHaptic("error");
      setErrorMessage(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="mobile-auth-overlay"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 1100,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        animation: "authFadeIn 0.22s ease",
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes authFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes authDrawerSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

      {/* Dedicated Native Mobile Auth Sheet */}
      <div
        className="mobile-auth-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxHeight: "94vh",
          backgroundColor: "var(--bg-card-solid)",
          borderTop: "1px solid var(--border-card)",
          borderRadius: "28px 28px 0 0",
          boxShadow: "0 -12px 48px rgba(0, 0, 0, 0.8)",
          display: "flex",
          flexDirection: "column",
          animation: "authDrawerSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          overflow: "hidden",
        }}
      >
        {/* Grab Handle */}
        <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: "12px 0 6px" }}>
          <div
            style={{
              width: "44px",
              height: "5px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--border-strong)",
            }}
          />
        </div>

        {/* Scrollable Form Content */}
        <div
          style={{
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            padding: "12px 20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {/* Header Row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "14px",
                  background: "var(--accent)",
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 4px 16px var(--accent-glow)",
                  flexShrink: 0,
                }}
              >
                <KeyRound size={22} color="#fff" strokeWidth={2.4} />
              </div>
              <div>
                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
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
                    ? "Sign in to access your synced loan ledger"
                    : mode === "signup"
                    ? "Sync your education loan across all devices"
                    : mode === "magiclink"
                    ? "We'll email you a secure one-tap login link"
                    : "Enter your email to receive recovery instructions"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                onClose?.();
              }}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "var(--bg-sunken)",
                border: "1px solid var(--border-subtle)",
                display: "grid",
                placeItems: "center",
                color: "var(--text-dim)",
                flexShrink: 0,
              }}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Segmented Switcher for Mobile: Sign In vs Sign Up */}
          {(mode === "signin" || mode === "signup") && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                backgroundColor: "var(--bg-sunken)",
                padding: "4px",
                borderRadius: "16px",
                border: "1px solid var(--border-subtle)",
                gap: "4px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  setMode("signin");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                style={{
                  height: "40px",
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  fontWeight: mode === "signin" ? 700 : 600,
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
                  triggerHaptic("light");
                  setMode("signup");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                style={{
                  height: "40px",
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  fontWeight: mode === "signup" ? 700 : 600,
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

          {/* Error Message Pill */}
          {errorMessage && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "14px",
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

          {/* Success Message Banner */}
          {successMessage && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 14px",
                borderRadius: "14px",
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
            {/* Name Input (Sign Up only) */}
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
                    size={18}
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
                    autoComplete="name"
                    style={{
                      width: "100%",
                      height: "50px",
                      padding: "0 14px 0 42px",
                      backgroundColor: "var(--bg-sunken)",
                      border: "1px solid var(--border-card)",
                      borderRadius: "14px",
                      fontSize: "16px", // 16px prevents iOS Safari auto-zoom
                      color: "var(--text-main)",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
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
                  size={18}
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
                  autoCapitalize="none"
                  autoComplete="email"
                  style={{
                    width: "100%",
                    height: "50px",
                    padding: "0 14px 0 42px",
                    backgroundColor: "var(--bg-sunken)",
                    border: "1px solid var(--border-card)",
                    borderRadius: "14px",
                    fontSize: "16px",
                    color: "var(--text-main)",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Password Input (SignIn & SignUp) */}
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
                        triggerHaptic("light");
                        setMode("forgot");
                        setErrorMessage("");
                      }}
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--accent)",
                        fontWeight: 600,
                      }}
                    >
                      Forgot?
                    </button>
                  )}
                </div>

                <div style={{ position: "relative" }}>
                  <Lock
                    size={18}
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
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    style={{
                      width: "100%",
                      height: "50px",
                      padding: "0 44px 0 42px",
                      backgroundColor: "var(--bg-sunken)",
                      border: "1px solid var(--border-card)",
                      borderRadius: "14px",
                      fontSize: "16px",
                      color: "var(--text-main)",
                      outline: "none",
                    }}
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
                      padding: "6px",
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{
                width: "100%",
                height: "52px",
                borderRadius: "16px",
                fontSize: "1rem",
                fontWeight: 800,
                marginTop: "4px",
                boxShadow: "0 6px 20px var(--accent-glow)",
              }}
            >
              <span>
                {isSubmitting
                  ? "Please wait..."
                  : mode === "signin"
                  ? "Sign In"
                  : mode === "signup"
                  ? "Create Account"
                  : mode === "magiclink"
                  ? "Send Magic Link"
                  : "Send Reset Link"}
              </span>
              {!isSubmitting && <ArrowRight size={18} strokeWidth={2.5} />}
            </button>
          </form>

          {/* Alternate Mobile Shortcuts: Magic Link / Passwordless */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
            {mode === "signin" && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  setMode("magiclink");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                style={{
                  height: "44px",
                  borderRadius: "14px",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  backgroundColor: "var(--bg-sunken)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <Sparkles size={15} style={{ color: "var(--accent)" }} />
                <span>Sign in with 1-Tap Magic Link</span>
              </button>
            )}

            {(mode === "magiclink" || mode === "forgot") && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  setMode("signin");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                style={{
                  height: "44px",
                  borderRadius: "14px",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  backgroundColor: "var(--bg-sunken)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                Back to Email & Password
              </button>
            )}

            {/* Continue as Guest option */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                onClose?.();
              }}
              style={{
                height: "38px",
                fontSize: "0.8125rem",
                color: "var(--text-dim)",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              Continue as Guest (Offline)
            </button>
          </div>

          {/* Security Assurance */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              paddingTop: "6px",
              fontSize: "0.6875rem",
              color: "var(--text-dim)",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            <ShieldCheck size={14} style={{ color: "var(--accent)" }} />
            <span>End-to-end encrypted · Powered by Supabase</span>
          </div>
        </div>
      </div>
    </div>
  );
}
