import type { APIRoute } from "astro";
import { createServerSupabaseClient } from "../../db/supabase-server";

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const supabase = createServerSupabaseClient(cookies);

    // Test połączenia - pobierz liczbę tabel
    const { data, error } = await supabase.from("flashcards").select("id").limit(1);

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
          hint: "Sprawdź czy tabele są utworzone w Supabase",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Połączenie z Supabase działa!",
        tables: "flashcards dostępna",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
