import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { createTestUser, cleanupTestData, testApiUrl } from "../setup";

describe("POST /api/generate-flashcards", () => {
  let testUser: { user: { id: string }; session: { access_token: string } } | null = null;

  beforeAll(async () => {
    const email = `test-${Date.now()}@example.com`;
    testUser = await createTestUser(email, "test-password-123");
  });

  afterAll(async () => {
    if (testUser?.user.id) {
      await cleanupTestData(testUser.user.id);
    }
  });

  test("zwraca 401 bez autoryzacji", async () => {
    const response = await fetch(`${testApiUrl}/api/generate-flashcards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Test text" }),
    });
    expect(response.status).toBe(401);
  });

  test("zwraca 400 dla pustego tekstu", async () => {
    if (!testUser?.session.access_token) return;

    const response = await fetch(`${testApiUrl}/api/generate-flashcards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testUser.session.access_token}`,
      },
      body: JSON.stringify({ text: "" }),
    });
    expect(response.status).toBe(400);
  });

  test("generuje fiszki z tekstu", async () => {
    if (!testUser?.session.access_token) return;

    const testText = `
      JavaScript to język programowania.
      React to biblioteka do budowania interfejsów użytkownika.
      TypeScript dodaje typowanie do JavaScript.
    `;

    const response = await fetch(`${testApiUrl}/api/generate-flashcards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testUser.session.access_token}`,
      },
      body: JSON.stringify({ text: testText }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.flashcards).toBeDefined();
    expect(Array.isArray(data.flashcards)).toBe(true);
    expect(data.flashcards.length).toBeGreaterThan(0);
    expect(data.flashcards[0]).toHaveProperty("front");
    expect(data.flashcards[0]).toHaveProperty("back");
  });
});
