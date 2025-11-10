import { describe, test, expect } from "vitest";
import {
  calculateStreak,
  getMostActiveDay,
  groupByDate,
  countActiveDays,
  safeAverage,
  roundTo,
} from "./stats-utils";
import type { ReviewSession } from "../types";

describe("stats-utils", () => {
  describe("calculateStreak", () => {
    test("zwraca 0 dla pustej tablicy", () => {
      expect(calculateStreak([])).toBe(0);
    });

    test("zwraca 1 dla pojedynczej sesji", () => {
      const sessions: ReviewSession[] = [
        {
          id: "1",
          user_id: "user1",
          completed_at: "2025-01-01T10:00:00Z",
          cards_reviewed: 5,
          cards_correct: 4,
          accuracy: 80,
        },
      ];
      expect(calculateStreak(sessions)).toBe(1);
    });

    test("oblicza streak dla kolejnych dni", () => {
      const sessions: ReviewSession[] = [
        {
          id: "1",
          user_id: "user1",
          completed_at: "2025-01-01T10:00:00Z",
          cards_reviewed: 5,
          cards_correct: 4,
          accuracy: 80,
        },
        {
          id: "2",
          user_id: "user1",
          completed_at: "2025-01-02T10:00:00Z",
          cards_reviewed: 5,
          cards_correct: 4,
          accuracy: 80,
        },
        {
          id: "3",
          user_id: "user1",
          completed_at: "2025-01-03T10:00:00Z",
          cards_reviewed: 5,
          cards_correct: 4,
          accuracy: 80,
        },
      ];
      expect(calculateStreak(sessions)).toBe(3);
    });

    test("resetuje streak przy przerwie", () => {
      const sessions: ReviewSession[] = [
        {
          id: "1",
          user_id: "user1",
          completed_at: "2025-01-01T10:00:00Z",
          cards_reviewed: 5,
          cards_correct: 4,
          accuracy: 80,
        },
        {
          id: "2",
          user_id: "user1",
          completed_at: "2025-01-02T10:00:00Z",
          cards_reviewed: 5,
          cards_correct: 4,
          accuracy: 80,
        },
        {
          id: "3",
          user_id: "user1",
          completed_at: "2025-01-05T10:00:00Z", // Przerwa 3 dni
          cards_reviewed: 5,
          cards_correct: 4,
          accuracy: 80,
        },
      ];
      expect(calculateStreak(sessions)).toBe(2); // Najdłuższy streak to 2
    });

    test("pomija nieprawidłowe daty", () => {
      const sessions: ReviewSession[] = [
        {
          id: "1",
          user_id: "user1",
          completed_at: "invalid-date",
          cards_reviewed: 5,
          cards_correct: 4,
          accuracy: 80,
        },
        {
          id: "2",
          user_id: "user1",
          completed_at: "2025-01-01T10:00:00Z",
          cards_reviewed: 5,
          cards_correct: 4,
          accuracy: 80,
        },
      ];
      expect(calculateStreak(sessions)).toBe(1);
    });
  });

  describe("getMostActiveDay", () => {
    test("zwraca null dla pustej tablicy", () => {
      expect(getMostActiveDay([])).toBeNull();
    });

    test("zwraca najaktywniejszy dzień tygodnia", () => {
      const sessions: ReviewSession[] = [
        {
          id: "1",
          user_id: "user1",
          completed_at: "2025-01-06T10:00:00Z", // Poniedziałek
          cards_reviewed: 5,
          cards_correct: 4,
          accuracy: 80,
        },
        {
          id: "2",
          user_id: "user1",
          completed_at: "2025-01-07T10:00:00Z", // Wtorek
          cards_reviewed: 5,
          cards_correct: 4,
          accuracy: 80,
        },
        {
          id: "3",
          user_id: "user1",
          completed_at: "2025-01-13T10:00:00Z", // Poniedziałek (2x)
          cards_reviewed: 5,
          cards_correct: 4,
          accuracy: 80,
        },
      ];
      expect(getMostActiveDay(sessions)).toBe("Poniedziałek");
    });

    test("pomija nieprawidłowe daty", () => {
      const sessions: ReviewSession[] = [
        {
          id: "1",
          user_id: "user1",
          completed_at: "invalid-date",
          cards_reviewed: 5,
          cards_correct: 4,
          accuracy: 80,
        },
      ];
      expect(getMostActiveDay(sessions)).toBeNull();
    });
  });

  describe("groupByDate", () => {
    test("grupuje powtórki po datach", () => {
      const reviews = [
        { reviewed_at: "2025-01-01T10:00:00Z" },
        { reviewed_at: "2025-01-01T15:00:00Z" },
        { reviewed_at: "2025-01-02T10:00:00Z" },
      ];
      const result = groupByDate(reviews);
      expect(result["2025-01-01"]).toBe(2);
      expect(result["2025-01-02"]).toBe(1);
    });

    test("zwraca pusty obiekt dla pustej tablicy", () => {
      expect(groupByDate([])).toEqual({});
    });
  });

  describe("countActiveDays", () => {
    test("zlicza unikalne dni z aktywnością", () => {
      const sessions: ReviewSession[] = [
        {
          id: "1",
          user_id: "user1",
          completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 dzień temu
          cards_reviewed: 5,
          cards_correct: 4,
          accuracy: 80,
        },
        {
          id: "2",
          user_id: "user1",
          completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dni temu
          cards_reviewed: 5,
          cards_correct: 4,
          accuracy: 80,
        },
        {
          id: "3",
          user_id: "user1",
          completed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 dni temu (poza zakresem)
          cards_reviewed: 5,
          cards_correct: 4,
          accuracy: 80,
        },
      ];
      expect(countActiveDays(sessions, 7)).toBe(2);
    });

    test("zwraca 0 dla pustej tablicy", () => {
      expect(countActiveDays([], 7)).toBe(0);
    });
  });

  describe("safeAverage", () => {
    test("oblicza średnią z tablicy liczb", () => {
      expect(safeAverage([1, 2, 3, 4, 5])).toBe(3);
    });

    test("zwraca 0 dla pustej tablicy", () => {
      expect(safeAverage([])).toBe(0);
    });

    test("obsługuje liczby ujemne", () => {
      expect(safeAverage([-5, 0, 5])).toBe(0);
    });
  });

  describe("roundTo", () => {
    test("zaokrągla do 2 miejsc dziesiętnych (domyślnie)", () => {
      expect(roundTo(3.14159)).toBe(3.14);
    });

    test("zaokrągla do określonej liczby miejsc", () => {
      expect(roundTo(3.14159, 3)).toBe(3.142);
    });

    test("obsługuje liczby całkowite", () => {
      expect(roundTo(5, 2)).toBe(5);
    });
  });
});
