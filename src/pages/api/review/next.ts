import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../../db/supabase-server';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
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
    const nowIso = new Date().toISOString();
    
    // Sprawdź parametr force z URL
    const url = new URL(request.url);
    const force = url.searchParams.get('force') === 'true';

    let cards: any[] = [];

    if (force) {
      // Tryb force: zwróć wszystkie dostępne karty użytkownika (max 20)
      const { data: allCards, error: fcErr } = await supabase
        .from('flashcards')
        .select('id, front, back')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (fcErr) {
        console.error('flashcards error:', fcErr);
        return new Response(
          JSON.stringify({ error: 'Błąd pobierania fiszek' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      cards = allCards || [];
    } else {
      // Tryb normalny: tylko należne karty (due_at <= now)
      const { data: dueSched, error: dueErr } = await supabase
        .from('card_scheduling')
        .select('card_id, due_at, updated_at')
        .eq('user_id', userId)
        .lte('due_at', nowIso)
        .order('due_at', { ascending: true })
        .order('updated_at', { ascending: true })
        .limit(40);

      if (dueErr) {
        console.error('card_scheduling error:', dueErr);
        return new Response(
          JSON.stringify({ error: 'Błąd pobierania harmonogramu' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const dueIds = (dueSched || []).map((r) => r.card_id);

      if (dueIds.length > 0) {
        const { data: dueCards, error: fcErr } = await supabase
          .from('flashcards')
          .select('id, front, back')
          .eq('user_id', userId)
          .in('id', dueIds)
          .limit(20);
        
        if (fcErr) {
          console.error('flashcards due error:', fcErr);
          return new Response(
            JSON.stringify({ error: 'Błąd pobierania fiszek' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
        cards = dueCards || [];
      }

      // Jeśli mniej niż 20 należnych kart, dodaj nowe karty (bez harmonogramu)
      if (cards.length < 20) {
        const { data: schedAll } = await supabase
          .from('card_scheduling')
          .select('card_id')
          .eq('user_id', userId)
          .limit(500);
        
        const scheduledSet = new Set((schedAll || []).map((r) => r.card_id));
        
        const { data: recentCards } = await supabase
          .from('flashcards')
          .select('id, front, back')
          .eq('user_id', userId)
          .order('created_at', { ascending: true })
          .limit(200);
        
        if (recentCards && recentCards.length) {
          for (const c of recentCards) {
            if (!scheduledSet.has(c.id)) {
              cards.push(c);
              if (cards.length >= 20) break;
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ cards: cards.slice(0, 20) }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('❌ review/next error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Błąd pobierania kart do powtórki' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

