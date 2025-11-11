import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pobierz parametr redirect z URL
  const getRedirectTo = () => {
    if (typeof window === "undefined") return "/dashboard";
    const urlParams = new URLSearchParams(window.location.search);
    const rawRedirect = urlParams.get("redirect");

    // Walidacja redirect - tylko wewnętrzne ścieżki
    let redirectTo = "/dashboard";
    if (rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.includes("//")) {
      redirectTo = rawRedirect;
    }
    return redirectTo;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("🔐 Attempting login...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log("🔐 Login successful, checking session...");

      // Sprawdź czy sesja jest zapisana
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("🔐 Session after login:", {
        hasSession: !!session,
        userEmail: session?.user?.email,
      });

      // Sprawdź localStorage
      if (typeof window !== "undefined") {
        const storedSession = localStorage.getItem("supabase.auth.token");
        console.log("🔐 localStorage after login:", {
          hasStoredSession: !!storedSession,
          storedSessionLength: storedSession?.length || 0,
        });
      }

      console.log("🔐 Redirecting to:", getRedirectTo());
      // Poczekaj dłużej, aby upewnić się, że sesja jest zapisana w localStorage
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Redirect to original page or dashboard
      window.location.href = getRedirectTo();
    } catch (err: unknown) {
      console.error("❌ Login error:", err);
      setError(err instanceof Error ? err.message : "Niepoprawne dane logowania");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="twoj@email.pl"
        />
      </div>

      {/* Hasło */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Hasło
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="••••••••"
        />
      </div>

      {/* Error message */}
      {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Logowanie..." : "Zaloguj się"}
      </button>
    </form>
  );
}
