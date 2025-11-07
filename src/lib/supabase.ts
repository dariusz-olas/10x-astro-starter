import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// 🔒 SECURITY: Klucze Supabase (PUBLIC_*) są bezpieczne do użycia w kliencie,
// ale najlepiej przechowywać je w zmiennych środowiskowych.
// Wymagane zmienne środowiskowe w .env:
// - PUBLIC_SUPABASE_URL (pobierz z Supabase Dashboard -> Settings -> API)
// - PUBLIC_SUPABASE_ANON_KEY (pobierz z Supabase Dashboard -> Settings -> API)

let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  // W SSR, zwróć null lub throw error - Supabase client powinien być używany tylko w browserze
  if (typeof window === 'undefined') {
    throw new Error('Supabase client can only be used in browser environment');
  }

  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = String(import.meta.env.PUBLIC_SUPABASE_URL || '').trim();
  const supabaseAnonKey = String(import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '').trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase credentials are required.\n' +
        'Dodaj do pliku .env:\n' +
        '  PUBLIC_SUPABASE_URL=twoj-url\n' +
        '  PUBLIC_SUPABASE_ANON_KEY=twoj-klucz\n' +
        'Pobierz wartości z: Supabase Dashboard -> Settings -> API'
    );
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return supabaseInstance;
}

// Eksportuj funkcję zamiast instancji, aby uniknąć inicjalizacji podczas SSR
export const supabase = typeof window !== 'undefined' ? getSupabaseClient() : null as any;

