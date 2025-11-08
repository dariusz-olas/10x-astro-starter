import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import { createClientLogger } from "../lib/logger-client";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [logger] = useState(() => createClientLogger({ component: "AuthWrapper" }));

  useEffect(() => {
    checkAuth();

    // Nasłuchuj zmian w sesji
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const userLogger = logger.withContext({
          userId: session.user.id,
          userEmail: session.user.email,
        });
        await userLogger.debug("Auth state changed", { event: _event });
        setUser(session.user);
        setLoading(false);
      } else {
        await logger.debug("Auth state changed - no session", { event: _event });
        setUser(null);
        // Nie ustawiaj loading na false od razu - poczekaj na checkAuth
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      // Poczekaj dłużej, aby upewnić się, że localStorage jest gotowy i sesja jest zapisana
      await new Promise((resolve) => setTimeout(resolve, 500));
      await logger.debug("Checking authentication");

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        await logger.error("Session check failed", {}, error);
      }

      if (!session) {
        await logger.warning("No session found, redirecting to login", {
          pathname: window.location.pathname,
        });
        const redirectTo = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?redirect=${redirectTo}`;
        return;
      }

      const userLogger = logger.withContext({
        userId: session.user.id,
        userEmail: session.user.email,
      });
      await userLogger.debug("Session found, user authenticated");
      setUser(session.user);
    } catch (error) {
      await logger.error("Authentication check failed", {}, error);
      const redirectTo = encodeURIComponent(window.location.pathname);
      window.location.href = `/login?redirect=${redirectTo}`;
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 text-lg">Ładowanie...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect już nastąpił
  }

  return <>{children}</>;
}
