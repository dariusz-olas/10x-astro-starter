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
    test("returns 0 for empty array", () => {
      expect(calculateStreak([])).toBe(0);
    });

    test("returns 1 for single session", () => {
      const sessions: ReviewSession[] = [
        {
          id: "1",
          user_id: "user1",
          completed_at: "2025-01-15T10:00:00.000Z",
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
      ];
      expect(calculateStreak(sessions)).toBe(1);
    });

    test("calculates consecutive days correctly", () => {
      const sessions: ReviewSession[] = [
        {
          id: "1",
          user_id: "user1",
          completed_at: "2025-01-13T10:00:00.000Z",
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
        {
          id: "2",
          user_id: "user1",
          completed_at: "2025-01-14T10:00:00.000Z",
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
        {
          id: "3",
          user_id: "user1",
          completed_at: "2025-01-15T10:00:00.000Z",
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
      ];
      expect(calculateStreak(sessions)).toBe(3);
    });

    test("handles non-consecutive days", () => {
      const sessions: ReviewSession[] = [
        {
          id: "1",
          user_id: "user1",
          completed_at: "2025-01-10T10:00:00.000Z",
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
        {
          id: "2",
          user_id: "user1",
          completed_at: "2025-01-11T10:00:00.000Z",
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
        {
          id: "3",
          user_id: "user1",
          completed_at: "2025-01-15T10:00:00.000Z", // Gap of 3 days
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
        {
          id: "4",
          user_id: "user1",
          completed_at: "2025-01-16T10:00:00.000Z",
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
      ];
      // Longest streak is 2 days (Jan 10-11 or Jan 15-16)
      expect(calculateStreak(sessions)).toBe(2);
    });

    test("handles multiple sessions on the same day", () => {
      const sessions: ReviewSession[] = [
        {
          id: "1",
          user_id: "user1",
          completed_at: "2025-01-13T10:00:00.000Z",
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
        {
          id: "2",
          user_id: "user1",
          completed_at: "2025-01-13T14:00:00.000Z", // Same day
          cards_reviewed: 5,
          cards_correct: 4,
          accuracy: 80,
        },
        {
          id: "3",
          user_id: "user1",
          completed_at: "2025-01-14T10:00:00.000Z",
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
      ];
      expect(calculateStreak(sessions)).toBe(2); // Jan 13-14
    });

    test("handles invalid dates gracefully", () => {
      const sessions: ReviewSession[] = [
        {
          id: "1",
          user_id: "user1",
          completed_at: "invalid-date",
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
        {
          id: "2",
          user_id: "user1",
          completed_at: "2025-01-15T10:00:00.000Z",
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
      ];
      // Should skip invalid date and return 1 for single valid date
      expect(calculateStreak(sessions)).toBe(1);
    });

    test("finds longest streak among multiple streaks", () => {
      const sessions: ReviewSession[] = [
        // First streak: 2 days
        {
          id: "1",
          user_id: "user1",
          completed_at: "2025-01-01T10:00:00.000Z",
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
        {
          id: "2",
          user_id: "user1",
          completed_at: "2025-01-02T10:00:00.000Z",
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
        // Gap
        // Second streak: 4 days (longest)
        {
          id: "3",
          user_id: "user1",
          completed_at: "2025-01-10T10:00:00.000Z",
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
        {
          id: "4",
          user_id: "user1",
          completed_at: "2025-01-11T10:00:00.000Z",
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
        {
          id: "5",
          user_id: "user1",
          completed_at: "2025-01-12T10:00:00.000Z",
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
        {
          id: "6",
          user_id: "user1",
          completed_at: "2025-01-13T10:00:00.000Z",
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
      ];
      expect(calculateStreak(sessions)).toBe(4);
    });
  });

  describe("getMostActiveDay", () => {
    test("returns null for empty array", () => {
      expect(getMostActiveDay([])).toBeNull();
    });

    test("returns day name for single session", () => {
      const sessions: ReviewSession[] = [
        {
          id: "1",
          user_id: "user1",
          completed_at: "2025-01-13T10:00:00.000Z", // Monday
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
      ];
      expect(getMostActiveDay(sessions)).toBe("Poniedziałek");
    });

    test("identifies most active day correctly", () => {
      const sessions: ReviewSession[] = [
        // 2 sessions on Wednesday
        {
          id: "1",
          user_id: "user1",
          completed_at: "2025-01-15T10:00:00.000Z", // Wednesday
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
        {
          id: "2",
          user_id: "user1",
          completed_at: "2025-01-22T10:00:00.000Z", // Wednesday
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
        // 1 session on Monday
        {
          id: "3",
          user_id: "user1",
          completed_at: "2025-01-13T10:00:00.000Z", // Monday
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
      ];
      expect(getMostActiveDay(sessions)).toBe("Środa");
    });

    test("handles all days of the week", () => {
      const days = [
        { date: "2025-01-12T10:00:00.000Z", name: "Niedziela" }, // Sunday
        { date: "2025-01-13T10:00:00.000Z", name: "Poniedziałek" }, // Monday
        { date: "2025-01-14T10:00:00.000Z", name: "Wtorek" }, // Tuesday
        { date: "2025-01-15T10:00:00.000Z", name: "Środa" }, // Wednesday
        { date: "2025-01-16T10:00:00.000Z", name: "Czwartek" }, // Thursday
        { date: "2025-01-17T10:00:00.000Z", name: "Piątek" }, // Friday
        { date: "2025-01-18T10:00:00.000Z", name: "Sobota" }, // Saturday
      ];

      days.forEach(({ date, name }) => {
        const sessions: ReviewSession[] = [
          {
            id: "1",
            user_id: "user1",
            completed_at: date,
            cards_reviewed: 10,
            cards_correct: 8,
            accuracy: 80,
          },
        ];
        expect(getMostActiveDay(sessions)).toBe(name);
      });
    });

    test("handles invalid dates gracefully", () => {
      const sessions: ReviewSession[] = [
        {
          id: "1",
          user_id: "user1",
          completed_at: "invalid-date",
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
        {
          id: "2",
          user_id: "user1",
          completed_at: "2025-01-15T10:00:00.000Z", // Wednesday
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
      ];
      // Should skip invalid date
      expect(getMostActiveDay(sessions)).toBe("Środa");
    });

    test("returns null when all dates are invalid", () => {
      const sessions: ReviewSession[] = [
        {
          id: "1",
          user_id: "user1",
          completed_at: "invalid-date",
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
      ];
      expect(getMostActiveDay(sessions)).toBeNull();
    });
  });

  describe("groupByDate", () => {
    test("returns empty object for empty array", () => {
      expect(groupByDate([])).toEqual({});
    });

    test("groups single review correctly", () => {
      const reviews = [{ reviewed_at: "2025-01-15T10:00:00.000Z" }];
      const result = groupByDate(reviews);
      expect(result).toEqual({ "2025-01-15": 1 });
    });

    test("groups multiple reviews on same day", () => {
      const reviews = [
        { reviewed_at: "2025-01-15T10:00:00.000Z" },
        { reviewed_at: "2025-01-15T14:00:00.000Z" },
        { reviewed_at: "2025-01-15T18:00:00.000Z" },
      ];
      const result = groupByDate(reviews);
      expect(result).toEqual({ "2025-01-15": 3 });
    });

    test("groups reviews across multiple days", () => {
      const reviews = [
        { reviewed_at: "2025-01-13T10:00:00.000Z" },
        { reviewed_at: "2025-01-14T10:00:00.000Z" },
        { reviewed_at: "2025-01-14T14:00:00.000Z" },
        { reviewed_at: "2025-01-15T10:00:00.000Z" },
      ];
      const result = groupByDate(reviews);
      expect(result).toEqual({
        "2025-01-13": 1,
        "2025-01-14": 2,
        "2025-01-15": 1,
      });
    });

    test("returns dates in YYYY-MM-DD format", () => {
      const reviews = [{ reviewed_at: "2025-01-05T10:00:00.000Z" }];
      const result = groupByDate(reviews);
      expect(result).toEqual({ "2025-01-05": 1 });
      expect(Object.keys(result)[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("countActiveDays", () => {
    test("returns 0 for empty array", () => {
      expect(countActiveDays([], 7)).toBe(0);
    });

    test("counts single active day", () => {
      const sessions: ReviewSession[] = [
        {
          id: "1",
          user_id: "user1",
          completed_at: new Date().toISOString(),
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
      ];
      expect(countActiveDays(sessions, 7)).toBe(1);
    });

    test("counts multiple sessions on same day as one active day", () => {
      const today = new Date().toISOString().split("T")[0];
      const sessions: ReviewSession[] = [
        {
          id: "1",
          user_id: "user1",
          completed_at: `${today}T10:00:00.000Z`,
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
        {
          id: "2",
          user_id: "user1",
          completed_at: `${today}T14:00:00.000Z`,
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
      ];
      expect(countActiveDays(sessions, 7)).toBe(1);
    });

    test("counts only days within specified period", () => {
      const now = new Date();
      const sessions: ReviewSession[] = [
        // Within 7 days
        {
          id: "1",
          user_id: "user1",
          completed_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
        {
          id: "2",
          user_id: "user1",
          completed_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
        // Outside 7 days
        {
          id: "3",
          user_id: "user1",
          completed_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
      ];
      expect(countActiveDays(sessions, 7)).toBe(2);
    });

    test("works with different day ranges", () => {
      const now = new Date();
      const sessions: ReviewSession[] = [
        {
          id: "1",
          user_id: "user1",
          completed_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
        {
          id: "2",
          user_id: "user1",
          completed_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
        {
          id: "3",
          user_id: "user1",
          completed_at: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          cards_reviewed: 10,
          cards_correct: 8,
          accuracy: 80,
        },
      ];
      expect(countActiveDays(sessions, 7)).toBe(1);
      expect(countActiveDays(sessions, 30)).toBe(3);
      expect(countActiveDays(sessions, 20)).toBe(2);
    });
  });

  describe("safeAverage", () => {
    test("returns 0 for empty array", () => {
      expect(safeAverage([])).toBe(0);
    });

    test("calculates average for single value", () => {
      expect(safeAverage([5])).toBe(5);
    });

    test("calculates average for multiple values", () => {
      expect(safeAverage([1, 2, 3, 4, 5])).toBe(3);
    });

    test("handles decimal values", () => {
      expect(safeAverage([1.5, 2.5, 3.5])).toBeCloseTo(2.5, 5);
    });

    test("handles negative values", () => {
      expect(safeAverage([-5, -10, -15])).toBe(-10);
    });

    test("handles mixed positive and negative values", () => {
      expect(safeAverage([-5, 0, 5])).toBe(0);
    });

    test("handles zero values", () => {
      expect(safeAverage([0, 0, 0])).toBe(0);
    });

    test("handles large arrays", () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => i + 1);
      expect(safeAverage(largeArray)).toBe(500.5);
    });
  });

  describe("roundTo", () => {
    test("rounds to 2 decimal places by default", () => {
      expect(roundTo(3.14159)).toBe(3.14);
      expect(roundTo(2.5555)).toBe(2.56);
    });

    test("rounds to specified number of decimal places", () => {
      expect(roundTo(3.14159, 0)).toBe(3);
      expect(roundTo(3.14159, 1)).toBe(3.1);
      expect(roundTo(3.14159, 3)).toBe(3.142);
      expect(roundTo(3.14159, 4)).toBe(3.1416);
    });

    test("handles whole numbers", () => {
      expect(roundTo(5, 2)).toBe(5);
      expect(roundTo(5, 0)).toBe(5);
    });

    test("handles negative numbers", () => {
      expect(roundTo(-3.14159, 2)).toBe(-3.14);
      expect(roundTo(-2.5555, 2)).toBe(-2.56);
    });

    test("handles zero", () => {
      expect(roundTo(0, 2)).toBe(0);
      expect(roundTo(0, 5)).toBe(0);
    });

    test("handles rounding up", () => {
      expect(roundTo(1.995, 2)).toBe(2);
      expect(roundTo(1.666, 2)).toBe(1.67);
    });

    test("handles rounding down", () => {
      expect(roundTo(1.994, 2)).toBe(1.99);
      expect(roundTo(1.664, 2)).toBe(1.66);
    });

    test("handles very small numbers", () => {
      expect(roundTo(0.0001, 2)).toBe(0);
      expect(roundTo(0.0001, 4)).toBe(0.0001);
    });

    test("handles very large numbers", () => {
      expect(roundTo(123456.789, 2)).toBe(123456.79);
      expect(roundTo(999999.999, 2)).toBe(1000000);
    });
  });
});
