import type { APIRoute } from 'astro';
import { generateFlashcards } from '../../lib/openrouter';
import { createServerSupabaseClient } from '../../db/supabase-server';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Sprawdź autentykację
    const supabase = createServerSupabaseClient(cookies);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Nieautoryzowany dostęp' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Pobierz body
    if (!request.body) {
      return new Response(
        JSON.stringify({ error: 'Brak danych w żądaniu' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError: any) {
      return new Response(
        JSON.stringify({ error: 'Nieprawidłowy format danych JSON' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { text } = requestData || {};

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Tekst nie może być pusty' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Wygeneruj fiszki
    const flashcards = await generateFlashcards(text);

    return new Response(
      JSON.stringify({ flashcards }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Błąd generowania fiszek',
        details: import.meta.env.DEV ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

