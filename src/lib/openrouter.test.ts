import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

// Mock logger to avoid file system operations in tests
vi.mock("./logger-server", () => ({
  createServerLogger: vi.fn(() => ({
    info: vi.fn().mockResolvedValue(undefined),
    error: vi.fn().mockResolvedValue(undefined),
    debug: vi.fn().mockResolvedValue(undefined),
    warning: vi.fn().mockResolvedValue(undefined),
    withContext: vi.fn().mockReturnThis(),
  })),
}));

describe("openrouter", () => {
  // Store original fetch
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Reset modules before each test to get fresh imports
    vi.resetModules();

    // Mock fetch by default
    global.fetch = vi.fn();

    // Mock import.meta.env using vi.stubEnv
    vi.stubEnv("OPENROUTER_API_KEY", "test-api-key");
    vi.stubEnv("DEV", "false");
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe("generateFlashcards", () => {
    test("successfully generates flashcards with valid response", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                flashcards: [
                  { front: "What is TypeScript?", back: "A typed superset of JavaScript" },
                  { front: "What is Node.js?", back: "A JavaScript runtime" },
                ],
              }),
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const { generateFlashcards } = await import("./openrouter");
      const result = await generateFlashcards("Learn TypeScript");

      expect(result).toEqual([
        { front: "What is TypeScript?", back: "A typed superset of JavaScript" },
        { front: "What is Node.js?", back: "A JavaScript runtime" },
      ]);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test("throws error when API key is missing", async () => {
      vi.stubEnv("OPENROUTER_API_KEY", "");
      vi.resetModules();

      const { generateFlashcards } = await import("./openrouter");

      await expect(generateFlashcards("Test text")).rejects.toThrow(
        /OPENROUTER_API_KEY nie jest skonfigurowany/
      );
    });

    test("throws error when text is empty", async () => {
      const { generateFlashcards } = await import("./openrouter");

      await expect(generateFlashcards("")).rejects.toThrow(/Tekst nie może być pusty/);
      await expect(generateFlashcards("   ")).rejects.toThrow(/Tekst nie może być pusty/);
    });

    test("handles API error response", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => ({
          error: { message: "API Error" },
        }),
      });

      const { generateFlashcards } = await import("./openrouter");
      await expect(generateFlashcards("Test text")).rejects.toThrow(/API Error/);
    });

    test("handles network error", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const { generateFlashcards } = await import("./openrouter");
      await expect(generateFlashcards("Test text")).rejects.toThrow(/Network error/);
    });

    test("handles response with no choices", async () => {
      const mockResponse = {
        choices: [],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const { generateFlashcards } = await import("./openrouter");
      await expect(generateFlashcards("Test text")).rejects.toThrow(/Brak odpowiedzi z API/);
    });

    test("handles response with empty content", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "",
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const { generateFlashcards } = await import("./openrouter");
      await expect(generateFlashcards("Test text")).rejects.toThrow(/Pusta odpowiedź z API/);
    });

    test("extracts JSON from markdown code block", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "```json\n" + JSON.stringify({
                flashcards: [
                  { front: "Question?", back: "Answer" },
                ],
              }) + "\n```",
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const { generateFlashcards } = await import("./openrouter");
      const result = await generateFlashcards("Test text");

      expect(result).toEqual([
        { front: "Question?", back: "Answer" },
      ]);
    });

    test("extracts JSON from code block without language", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "```\n" + JSON.stringify({
                flashcards: [
                  { front: "Question?", back: "Answer" },
                ],
              }) + "\n```",
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const { generateFlashcards } = await import("./openrouter");
      const result = await generateFlashcards("Test text");

      expect(result).toEqual([
        { front: "Question?", back: "Answer" },
      ]);
    });

    test("finds JSON object within text", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "Here are the flashcards: " + JSON.stringify({
                flashcards: [
                  { front: "Question?", back: "Answer" },
                ],
              }) + " That's all!",
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const { generateFlashcards } = await import("./openrouter");
      const result = await generateFlashcards("Test text");

      expect(result).toEqual([
        { front: "Question?", back: "Answer" },
      ]);
    });

    test("throws error when JSON is not found", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "This is plain text without any JSON structure at all",
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const { generateFlashcards } = await import("./openrouter");
      // The code tries to parse any content, so it will throw a JSON parsing error
      await expect(generateFlashcards("Test text")).rejects.toThrow(
        /Błąd parsowania JSON|Nie znaleziono JSON/
      );
    });

    test("throws error when JSON parsing fails", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "{ invalid json }",
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const { generateFlashcards } = await import("./openrouter");
      await expect(generateFlashcards("Test text")).rejects.toThrow(/Błąd parsowania JSON/);
    });

    test("throws error when response has no flashcards array", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                cards: [], // Wrong property name
              }),
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const { generateFlashcards } = await import("./openrouter");
      await expect(generateFlashcards("Test text")).rejects.toThrow(
        /Nieprawidłowy format odpowiedzi z AI/
      );
    });

    test("throws error when flashcards is not an array", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                flashcards: "not an array",
              }),
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const { generateFlashcards } = await import("./openrouter");
      await expect(generateFlashcards("Test text")).rejects.toThrow(
        /Nieprawidłowy format odpowiedzi z AI/
      );
    });

    test("sends correct request to OpenRouter API", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                flashcards: [
                  { front: "Q", back: "A" },
                ],
              }),
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const { generateFlashcards } = await import("./openrouter");
      await generateFlashcards("Test text");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://openrouter.ai/api/v1/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer test-api-key",
          }),
          body: expect.stringContaining("Test text"),
        })
      );
    });

    test("uses correct model in request", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                flashcards: [
                  { front: "Q", back: "A" },
                ],
              }),
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const { generateFlashcards } = await import("./openrouter");
      await generateFlashcards("Test text");

      const callArgs = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.model).toBe("openai/gpt-4o-mini");
      expect(body.temperature).toBe(0.7);
      expect(body.max_tokens).toBe(2000);
    });

    test("handles API error object in response", async () => {
      const mockResponse = {
        error: {
          message: "Rate limit exceeded",
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const { generateFlashcards } = await import("./openrouter");
      await expect(generateFlashcards("Test text")).rejects.toThrow(/Rate limit exceeded/);
    });
  });
});
