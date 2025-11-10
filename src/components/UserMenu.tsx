import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { createClientLogger } from "../lib/logger-client";
import { Button } from "./ui/button";
import type { User } from "@supabase/supabase-js";

// Logger instance dla komponentu
const logger = createClientLogger({ component: "UserMenu" });

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        logger.debug("Fetching user session");
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          logger.error("Failed to fetch user session", {}, error);
          return;
        }

        if (session) {
          setUser(session.user);
          logger.info("User session loaded", { userId: session.user.id, email: session.user.email });
        }
      } catch (err) {
        logger.error("Error in fetchUser", {}, err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Nasłuchuj zmian w sesji
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        logger.info("User session changed", { userId: session.user.id, email: session.user.email });
      } else {
        logger.info("User logged out");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Zamknij menu po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      logger.info("User initiated logout");

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      logger.info("Logout successful, redirecting to login");
      window.location.href = "/login";
    } catch (error) {
      logger.error("Logout failed", {}, error);
      alert("Błąd podczas wylogowania. Spróbuj ponownie.");
      setLoggingOut(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="fixed top-4 right-4 z-50" ref={menuRef}>
      <Button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:text-white"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <span className="text-sm font-medium hidden sm:inline">{user.email}</span>
        <span className="text-sm font-medium sm:hidden">👤</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
        >
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                logger.info("Profile clicked (placeholder)");
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition focus:outline-none focus:bg-gray-100"
              role="menuitem"
              tabIndex={0}
            >
              Profil
            </button>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition focus:outline-none focus:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              role="menuitem"
              tabIndex={0}
            >
              {loggingOut ? "Wylogowywanie..." : "Wyloguj się"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
