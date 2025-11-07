import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../../db/supabase-server';
import { gradeAnswer, nextDueAt } from '../../../lib/scheduling';

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

    const { cardId, grade } = body || {};
    
    // Walidacja
    if (!cardId || typeof grade !== 'number' || grade < 0 || grade > 3) {
      return new Response(
        JSON.stringify({ error: 'Wymagane: { cardId, grade: 0..3 }' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Pobierz aktualny stan harmonogramu (lub wartości domyślne)
    const { data: schedRow } = await supabase
      .from('card_scheduling')
      .select('ease, interval_days, repetitions')
      .eq('user_id', userId)
      .eq('card_id', cardId)
      .maybeSingle();

    const current = {
      ease: schedRow?.ease ?? 250,
      intervalDays: schedRow?.interval_days ?? 0,
      repetitions: schedRow?.repetitions ?? 0,
    };

    // Oblicz nowy stan używając algorytmu SM-2 lite
    const result = gradeAnswer({ ...current, grade });
    const dueAt = nextDueAt(result.nextIntervalDays);

    // Aktualizuj harmonogram
    const { error: upsertErr } = await supabase
      .from('card_scheduling')
      .upsert({
        card_id: cardId,
        user_id: userId,
        ease: result.nextEase,
        interval_days: result.nextIntervalDays,
        repetitions: result.nextRepetitions,
        due_at: dueAt.toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'card_id' });

    if (upsertErr) {
      console.error('sched upsert error:', upsertErr);
      return new Response(
        JSON.stringify({ error: 'Błąd zapisu harmonogramu' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Zapisz historię oceny
    const { error: histErr } = await supabase
      .from('card_reviews')
      .insert({
        user_id: userId,
        card_id: cardId,
        grade,
        prev_interval_days: current.intervalDays,
        new_interval_days: result.nextIntervalDays,
        prev_ease: current.ease,
        new_ease: result.nextEase,
      });

    if (histErr) {
      console.error('history insert error:', histErr);
      // Nie zwracamy błędu - historia jest opcjonalna
    }

    return new Response(
      JSON.stringify({
        cardId,
        next: {
          ease: result.nextEase,
          intervalDays: result.nextIntervalDays,
          repetitions: result.nextRepetitions,
          dueAt: dueAt.toISOString(),
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('❌ review/submit error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Błąd zapisu odpowiedzi' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

