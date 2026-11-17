import React, { useState } from "react";
import {
  ArrowLeft,
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

export function MobileAuthPage() {
  const { signIn, signUp, signInWithMagicLink, resetPassword } = useAuth();
  const { changeTab, showToast, updateSettings, closeModal } = useMukt();

  const [mode, setMode] = useState("signin"); // 'signin', 'signup', 'magiclink', 'forgot'
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
          updateSettings({ onboarded: true }, false);
          showToast(`Welcome back, ${res.user?.user_metadata?.name || res.user?.email}!`);
          closeModal();
          changeTab("overview");
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
            updateSettings({ onboarded: true }, false);
            showToast("Welcome to Mukt! Your loan tracker is ready.");
            closeModal();
            changeTab("overview");
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
      className="mobile-auth-page"
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-app)",
        display: "flex",
        flexDirection: "column",
        paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
      }}
    >
      {/* Top Navigation Bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          height: "var(--header-h)",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--bg-glass)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-card)",
        }}
      >
        <button
          type="button"
          onClick={() => {
            triggerHaptic("light");
            changeTab("overview");
          }}
          style={{
            height: "36px",
            padding: "0 12px 0 8px",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--bg-sunken)",
            border: "1px solid var(--border-card)",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--text-main)",
            fontSize: "0.8125rem",
            fontWeight: 700,
          }}
          aria-label="Back to Overview"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: "var(--accent)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
              <rect width="48" height="48" rx="13" fill="var(--accent)" />
              <path
                d="M24 13 A11 11 0 1 1 13 24"
                fill="none"
                stroke="#fff"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <circle cx="16.2" cy="16.2" r="2.5" fill="#fff" />
            </svg>
          </div>
          <span style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-main)" }}>Mukt</span>
        </div>

        <div style={{ width: "65px", display: "flex", justifyContent: "flex-end" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "0.6875rem",
              fontWeight: 700,
              color: "var(--accent)",
              padding: "3px 8px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--accent-light)",
            }}
          >
            <ShieldCheck size={12} />
            Secure
          </span>
        </div>
      </header>

      {/* Main Page Content */}
      <div
        style={{
          flex: 1,
          padding: "24px 20px 40px",
          display: "flex",
          flexDirection: "column",
          maxWidth: "480px",
          margin: "0 auto",
          width: "100%",
          gap: "24px",
        }}
      >
        {/* Hero Section */}
        <div style={{ textAlign: "center", padding: "12px 0 4px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "18px",
              background: "var(--accent)",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 8px 24px var(--accent-glow)",
              margin: "0 auto 16px",
            }}
          >
            <KeyRound size={28} color="#fff" strokeWidth={2.4} />
          </div>

          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--text-main)",
              lineHeight: 1.2,
              marginBottom: "8px",
            }}
          >
            {mode === "signin"
              ? "Welcome back"
              : mode === "signup"
              ? "Create your account"
              : mode === "magiclink"
              ? "Passwordless login"
              : "Reset password"}
          </h1>

          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-dim)",
              lineHeight: 1.5,
              maxWidth: "340px",
              margin: "0 auto",
            }}
          >
            {mode === "signin"
              ? "Sign in to synchronize your loan, repayments, and exchange rates across all devices."
              : mode === "signup"
              ? "Keep your student loan ledger private and safely backed up with Supabase Cloud."
              : mode === "magiclink"
              ? "Enter your email address and we'll send a 1-tap authentication link directly to your inbox."
              : "We'll send password recovery instructions to your registered email."}
          </p>
        </div>

        {/* Segmented Switcher Pill: Sign In vs Sign Up */}
        {(mode === "signin" || mode === "signup") && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              backgroundColor: "var(--bg-sunken)",
              padding: "5px",
              borderRadius: "18px",
              border: "1px solid var(--border-subtle)",
              gap: "6px",
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
                height: "44px",
                borderRadius: "14px",
                fontSize: "0.9375rem",
                fontWeight: mode === "signin" ? 800 : 600,
                backgroundColor: mode === "signin" ? "var(--bg-card-solid)" : "transparent",
                color: mode === "signin" ? "var(--accent)" : "var(--text-dim)",
                boxShadow: mode === "signin" ? "0 4px 12px rgba(0, 0, 0, 0.3)" : "none",
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
                height: "44px",
                borderRadius: "14px",
                fontSize: "0.9375rem",
                fontWeight: mode === "signup" ? 800 : 600,
                backgroundColor: mode === "signup" ? "var(--bg-card-solid)" : "transparent",
                color: mode === "signup" ? "var(--accent)" : "var(--text-dim)",
                boxShadow: mode === "signup" ? "0 4px 12px rgba(0, 0, 0, 0.3)" : "none",
                border: mode === "signup" ? "1px solid var(--border-subtle)" : "none",
                transition: "all 0.18s ease",
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error Badge */}
        {errorMessage && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 16px",
              borderRadius: "16px",
              backgroundColor: "var(--danger-light)",
              color: "var(--danger)",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 16px",
              borderRadius: "16px",
              backgroundColor: "var(--success-light)",
              color: "var(--success)",
              fontSize: "0.875rem",
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          >
            <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Actual Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Name for Sign Up */}
          {mode === "signup" && (
            <div>
              <label
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Your Name
              </label>
              <div style={{ position: "relative" }}>
                <User
                  size={18}
                  style={{
                    position: "absolute",
                    left: "16px",
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
                    height: "52px",
                    padding: "0 16px 0 46px",
                    backgroundColor: "var(--bg-sunken)",
                    border: "1px solid var(--border-card)",
                    borderRadius: "16px",
                    fontSize: "16px", // 16px prevents iOS Safari auto-zoom
                    color: "var(--text-main)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--text-dim)",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={18}
                style={{
                  position: "absolute",
                  left: "16px",
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
                  height: "52px",
                  padding: "0 16px 0 46px",
                  backgroundColor: "var(--bg-sunken)",
                  border: "1px solid var(--border-card)",
                  borderRadius: "16px",
                  fontSize: "16px",
                  color: "var(--text-main)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Password (Sign In & Sign Up) */}
          {(mode === "signin" || mode === "signup") && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
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
                      fontSize: "0.8125rem",
                      color: "var(--accent)",
                      fontWeight: 700,
                    }}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>

              <div style={{ position: "relative" }}>
                <Lock
                  size={18}
                  style={{
                    position: "absolute",
                    left: "16px",
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
                    height: "52px",
                    padding: "0 46px 0 46px",
                    backgroundColor: "var(--bg-sunken)",
                    border: "1px solid var(--border-card)",
                    borderRadius: "16px",
                    fontSize: "16px",
                    color: "var(--text-main)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "14px",
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

          {/* Primary Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{
              width: "100%",
              height: "54px",
              borderRadius: "18px",
              fontSize: "1.0625rem",
              fontWeight: 800,
              marginTop: "8px",
              boxShadow: "0 8px 24px var(--accent-glow)",
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
            {!isSubmitting && <ArrowRight size={18} strokeWidth={2.6} />}
          </button>
        </form>

        {/* Mobile Alternative Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
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
                height: "48px",
                borderRadius: "16px",
                fontSize: "0.875rem",
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
              <Sparkles size={16} style={{ color: "var(--accent)" }} />
              <span>Passwordless Sign In with Magic Link</span>
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
                height: "48px",
                borderRadius: "16px",
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "var(--accent)",
                backgroundColor: "var(--bg-sunken)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              Back to Email & Password
            </button>
          )}

          {/* Continue as Guest Button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic("light");
              changeTab("overview");
            }}
            style={{
              height: "44px",
              borderRadius: "14px",
              fontSize: "0.8125rem",
              color: "var(--text-dim)",
              fontWeight: 600,
              textAlign: "center",
              border: "none",
              backgroundColor: "transparent",
            }}
          >
            Continue as Guest (Offline Mode)
          </button>
        </div>

        {/* Security Assurance Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginTop: "auto",
            paddingTop: "24px",
            fontSize: "0.75rem",
            color: "var(--text-dim)",
          }}
        >
          <ShieldCheck size={16} style={{ color: "var(--accent)" }} />
          <span>256-bit Encrypted · Powered by Supabase Cloud</span>
        </div>
      </div>
    </div>
  );
}
