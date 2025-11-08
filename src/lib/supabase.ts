import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// 🔒 SECURITY: Klucze Supabase (PUBLIC_*) są bezpieczne do użycia w kliencie,
// ale najlepiej przechowywać je w zmiennych środowiskowych.
// Wymagane zmienne środowiskowe w .env:
// - PUBLIC_SUPABASE_URL (pobierz z Supabase Dashboard -> Settings -> API)
// - PUBLIC_SUPABASE_ANON_KEY (pobierz z Supabase Dashboard -> Settings -> API)

let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // W Cloudflare Pages, zmienne środowiskowe są dostępne w runtime
  // Sprawdź czy są dostępne w import.meta.env
  const supabaseUrl =
    typeof import.meta !== "undefined" && import.meta.env
      ? String(import.meta.env.PUBLIC_SUPABASE_URL || "").trim()
      : "";
  const supabaseAnonKey =
    typeof import.meta !== "undefined" && import.meta.env
      ? String(import.meta.env.PUBLIC_SUPABASE_ANON_KEY || "").trim()
      : "";

  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMsg =
      "Supabase credentials are required.\n\n" +
      "W Cloudflare Pages Dashboard:\n" +
      "1. Przejdź do Settings → Environment Variables\n" +
      "2. Dodaj dla Production:\n" +
      "   - PUBLIC_SUPABASE_URL=https://twoj-projekt.supabase.co\n" +
      "   - PUBLIC_SUPABASE_ANON_KEY=twoj-anon-key\n\n" +
      "Pobierz wartości z: Supabase Dashboard → Settings → API\n\n" +
      "Po dodaniu zmiennych, zredeployuj aplikację.";

    console.error("❌", errorMsg);
    throw new Error(errorMsg);
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      storageKey: "supabase.auth.token",
    },
  });
  return supabaseInstance;
}

// Lazy initialization - tylko w browserze
export const supabase =
  typeof window !== "undefined"
    ? getSupabaseClient()
    : (() => {
        // W SSR zwróć proxy, który będzie inicjalizowany przy pierwszym użyciu w browserze
        return new Proxy({} as SupabaseClient, {
          get(target, prop) {
            if (typeof window !== "undefined") {
              return getSupabaseClient()[prop as keyof SupabaseClient];
            }
            throw new Error("Supabase client can only be used in browser environment");
          },
        });
      })();
