import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';

// 🔒 SECURITY: Serwerowy klient Supabase dla endpointów API
// Używa tego samego klucza anon, ale może być rozszerzony o service role key dla operacji admin
// Wymagane zmienne środowiskowe w .env:
// - PUBLIC_SUPABASE_URL
// - PUBLIC_SUPABASE_ANON_KEY

export function createServerSupabaseClient(cookies: AstroCookies): SupabaseClient {
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

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookies.get(name)?.value;
      },
      set(name: string, value: string, options?: any) {
        cookies.set(name, value, options);
      },
      remove(name: string, options?: any) {
        cookies.delete(name, options);
      },
    },
  });

  return client;
}

