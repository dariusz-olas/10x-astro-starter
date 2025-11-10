import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { createTestUser, cleanupTestData, testSupabase } from "../../setup";

describe("POST /api/review/submit", () => {
  let testUser: { user: { id: string }; session: { access_token: string } } | null = null;
  let testCardId: string | null = null;

  beforeAll(async () => {
    // Utwórz testowego użytkownika
    const email = `test-${Date.now()}@example.com`;
    testUser = await createTestUser(email, "test-password-123");

    // Utwórz testową fiszkę
    const { data: card } = await testSupabase
      .from("flashcards")
      .insert({
        user_id: testUser.user.id,
        front: "Test question",
        back: "Test answer",
        tags: [],
      })
      .select()
      .single();

    testCardId = card?.id || null;
  });

  afterAll(async () => {
    if (testUser?.user.id) {
      await cleanupTestData(testUser.user.id);
    }
  });

  test("zwraca 401 bez autoryzacji", async () => {
    const response = await fetch("http://localhost:4321/api/review/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: "test", grade: 2 }),
    });
    expect(response.status).toBe(401);
  });

  test("zwraca 400 dla nieprawidłowych danych", async () => {
    if (!testUser?.session.access_token) return;

    const response = await fetch("http://localhost:4321/api/review/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testUser.session.access_token}`,
      },
      body: JSON.stringify({ cardId: "invalid", grade: 5 }), // grade > 3
    });
    expect(response.status).toBe(400);
  });

  test("aktualizuje harmonogram dla oceny 'Good' (2)", async () => {
    if (!testUser?.session.access_token || !testCardId) return;

    const response = await fetch("http://localhost:4321/api/review/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testUser.session.access_token}`,
      },
      body: JSON.stringify({ cardId: testCardId, grade: 2 }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.next).toBeDefined();
    expect(data.next.repetitions).toBe(1);
    expect(data.next.intervalDays).toBe(1);
  });

  test("resetuje repetitions dla oceny 'Again' (0)", async () => {
    if (!testUser?.session.access_token || !testCardId) return;

    // Najpierw ustaw repetitions > 0
    await testSupabase.from("card_scheduling").upsert({
      card_id: testCardId,
      user_id: testUser.user.id,
      repetitions: 3,
      interval_days: 5,
      ease: 250,
    });

    const response = await fetch("http://localhost:4321/api/review/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testUser.session.access_token}`,
      },
      body: JSON.stringify({ cardId: testCardId, grade: 0 }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.next.repetitions).toBe(0);
    expect(data.next.intervalDays).toBe(1);
    expect(data.next.ease).toBe(230); // 250 - 20
  });
});
