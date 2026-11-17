import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Check active session
    supabase.auth.getSession().then(({ data: { session: currentSession }, error }) => {
      if (isMounted) {
        if (error) {
          console.warn("Supabase auth session error:", error.message);
        }
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setLoading(false);
      }
    });

    // Listen to auth state transitions (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (isMounted) {
        setSession(newSession);
        setUser(newSession?.user || null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Sign In with Email & Password
  const signIn = useCallback(async (email, password) => {
    if (!supabase) return { success: false, error: "Database not configured" };
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }
      return { success: true, user: data.user, session: data.session };
    } catch (err) {
      const msg = err.message || "Failed to sign in";
      setAuthError(msg);
      return { success: false, error: msg };
    }
  }, []);

  // Sign Up with Email, Password & optional Name
  const signUp = useCallback(async (email, password, { name = "" } = {}) => {
    if (!supabase) return { success: false, error: "Database not configured" };
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      });
      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }
      return {
        success: true,
        user: data.user,
        session: data.session,
        needsVerification: !data.session, // if confirm email is required
      };
    } catch (err) {
      const msg = err.message || "Failed to create account";
      setAuthError(msg);
      return { success: false, error: msg };
    }
  }, []);

  // Sign In with Magic Link (Passwordless OTP link)
  const signInWithMagicLink = useCallback(async (email) => {
    if (!supabase) return { success: false, error: "Database not configured" };
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      const msg = err.message || "Failed to send magic link";
      setAuthError(msg);
      return { success: false, error: msg };
    }
  }, []);

  // Sign Out
  const signOut = useCallback(async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out warning:", err);
    } finally {
      setSession(null);
      setUser(null);
    }
  }, []);

  // Reset Password Request
  const resetPassword = useCallback(async (email) => {
    if (!supabase) return { success: false, error: "Database not configured" };
    setAuthError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/#settings`,
      });
      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      const msg = err.message || "Failed to request password reset";
      setAuthError(msg);
      return { success: false, error: msg };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        authError,
        setAuthError,
        isAuthenticated: Boolean(user),
        signIn,
        signUp,
        signInWithMagicLink,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
