import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../../db/supabase-server';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createServerSupabaseClient(cookies);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const userId = session.user.id;

    // Parsuj body
    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Nieprawidłowe JSON body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { cardsReviewed, cardsCorrect } = body || {};
    
    // Walidacja
    if (typeof cardsReviewed !== 'number' || typeof cardsCorrect !== 'number' ||
        cardsReviewed < 0 || cardsCorrect < 0 || cardsCorrect > cardsReviewed) {
      return new Response(
        JSON.stringify({
          error: 'Wymagane: { cardsReviewed: number >= 0, cardsCorrect: number >= 0 && <= cardsReviewed }'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Zapisz sesję do review_sessions
    // Kolumna accuracy zostanie obliczona automatycznie przez computed column
    const { data, error: insertError } = await supabase
      .from('review_sessions')
      .insert({
        user_id: userId,
        completed_at: new Date().toISOString(),
        cards_reviewed: cardsReviewed,
        cards_correct: cardsCorrect,
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Błąd zapisu sesji powtórek:', insertError);
      return new Response(
        JSON.stringify({ error: 'Błąd zapisu sesji powtórek' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        id: data.id,
        completed_at: data.completed_at,
        cards_reviewed: data.cards_reviewed,
        cards_correct: data.cards_correct,
        accuracy: data.accuracy,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('❌ session-complete error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Błąd zapisu sesji' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

