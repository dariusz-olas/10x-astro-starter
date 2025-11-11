import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Hasła nie zgadzają się!");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Hasło musi mieć minimum 6 znaków!");
      return;
    }

    setLoading(true);

    try {
      console.log("🔐 Attempting registration...");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      console.log("🔐 Registration successful, redirecting to dashboard");
      // Poczekaj chwilę, aby upewnić się, że sesja jest zapisana w localStorage
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      console.error("❌ Registration error:", err);
      setError(err instanceof Error ? err.message : "Błąd rejestracji");
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
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="••••••••"
        />
        <p className="mt-1 text-xs text-gray-500">Minimum 6 znaków</p>
      </div>

      {/* Potwierdzenie hasła */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Potwierdź hasło
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
        {loading ? "Rejestrowanie..." : "Zarejestruj się"}
      </button>
    </form>
  );
}
