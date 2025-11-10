import { describe, test, expect, beforeEach, vi } from "vitest";
import {
  formatDatePL,
  formatDateOrDefault,
  getWeekStart,
  getMonthStart,
  getTodayISO,
} from "./dateUtils";

describe("dateUtils", () => {
  describe("formatDatePL", () => {
    test("formats valid ISO date string correctly", () => {
      const result = formatDatePL("2025-01-15T10:30:00.000Z");
      expect(result).toBe("15 stycznia 2025");
    });

    test("formats Date object correctly", () => {
      const date = new Date("2025-12-25T00:00:00.000Z");
      const result = formatDatePL(date);
      expect(result).toBe("25 grudnia 2025");
    });

    test("returns null for null input", () => {
      const result = formatDatePL(null);
      expect(result).toBeNull();
    });

    test("returns null for undefined input", () => {
      const result = formatDatePL(undefined);
      expect(result).toBeNull();
    });

    test("returns null for invalid date string", () => {
      const result = formatDatePL("invalid-date");
      expect(result).toBeNull();
    });

    test("formats all months correctly", () => {
      const months = [
        "stycznia",
        "lutego",
        "marca",
        "kwietnia",
        "maja",
        "czerwca",
        "lipca",
        "sierpnia",
        "września",
        "października",
        "listopada",
        "grudnia",
      ];

      months.forEach((month, index) => {
        const date = new Date(2025, index, 15);
        const result = formatDatePL(date);
        expect(result).toBe(`15 ${month} 2025`);
      });
    });

    test("handles different day numbers", () => {
      expect(formatDatePL("2025-01-01T00:00:00.000Z")).toBe("1 stycznia 2025");
      expect(formatDatePL("2025-01-31T00:00:00.000Z")).toBe("31 stycznia 2025");
    });
  });

  describe("formatDateOrDefault", () => {
    test("returns formatted date for valid input", () => {
      const result = formatDateOrDefault("2025-01-15T10:30:00.000Z");
      expect(result).toBe("15 stycznia 2025");
    });

    test("returns default message for null input", () => {
      const result = formatDateOrDefault(null);
      expect(result).toBe("Jeszcze nie zacząłeś");
    });

    test("returns default message for undefined input", () => {
      const result = formatDateOrDefault(undefined);
      expect(result).toBe("Jeszcze nie zacząłeś");
    });

    test("returns default message for invalid date", () => {
      const result = formatDateOrDefault("invalid-date");
      expect(result).toBe("Jeszcze nie zacząłeś");
    });
  });

  describe("getWeekStart", () => {
    beforeEach(() => {
      // Reset time mocks before each test
      vi.useRealTimers();
    });

    test("returns Monday for current week when today is Wednesday", () => {
      // Wednesday, January 15, 2025
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-01-15T12:00:00.000Z"));

      const result = getWeekStart();
      const date = new Date(result);

      // Monday should be January 13, 2025
      expect(date.getUTCDate()).toBe(13);
      expect(date.getUTCMonth()).toBe(0); // January
      expect(date.getUTCFullYear()).toBe(2025);
      expect(date.getUTCHours()).toBe(0);
      expect(date.getUTCMinutes()).toBe(0);
      expect(date.getUTCSeconds()).toBe(0);
      expect(date.getUTCMilliseconds()).toBe(0);

      vi.useRealTimers();
    });

    test("returns Monday for current week when today is Sunday", () => {
      // Sunday, January 19, 2025
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-01-19T12:00:00.000Z"));

      const result = getWeekStart();
      const date = new Date(result);

      // Monday should be January 13, 2025 (previous Monday)
      expect(date.getUTCDate()).toBe(13);
      expect(date.getUTCMonth()).toBe(0); // January

      vi.useRealTimers();
    });

    test("returns same day when today is Monday", () => {
      // Monday, January 13, 2025
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-01-13T12:00:00.000Z"));

      const result = getWeekStart();
      const date = new Date(result);

      expect(date.getUTCDate()).toBe(13);
      expect(date.getUTCMonth()).toBe(0); // January

      vi.useRealTimers();
    });

    test("sets time to midnight (00:00:00.000)", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-01-15T23:59:59.999Z"));

      const result = getWeekStart();
      const date = new Date(result);

      expect(date.getUTCHours()).toBe(0);
      expect(date.getUTCMinutes()).toBe(0);
      expect(date.getUTCSeconds()).toBe(0);
      expect(date.getUTCMilliseconds()).toBe(0);

      vi.useRealTimers();
    });
  });

  describe("getMonthStart", () => {
    beforeEach(() => {
      vi.useRealTimers();
    });

    test("returns first day of current month", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-01-15T12:00:00.000Z"));

      const result = getMonthStart();
      const date = new Date(result);

      expect(date.getUTCDate()).toBe(1);
      expect(date.getUTCMonth()).toBe(0); // January
      expect(date.getUTCFullYear()).toBe(2025);

      vi.useRealTimers();
    });

    test("sets time to midnight (00:00:00.000)", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-01-15T23:59:59.999Z"));

      const result = getMonthStart();
      const date = new Date(result);

      expect(date.getUTCHours()).toBe(0);
      expect(date.getUTCMinutes()).toBe(0);
      expect(date.getUTCSeconds()).toBe(0);
      expect(date.getUTCMilliseconds()).toBe(0);

      vi.useRealTimers();
    });

    test("works for different months", () => {
      vi.useFakeTimers();

      // Test February
      vi.setSystemTime(new Date("2025-02-28T12:00:00.000Z"));
      let result = getMonthStart();
      let date = new Date(result);
      expect(date.getUTCDate()).toBe(1);
      expect(date.getUTCMonth()).toBe(1); // February

      // Test December
      vi.setSystemTime(new Date("2025-12-31T23:59:59.999Z"));
      result = getMonthStart();
      date = new Date(result);
      expect(date.getUTCDate()).toBe(1);
      expect(date.getUTCMonth()).toBe(11); // December

      vi.useRealTimers();
    });

    test("handles first day of month correctly", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));

      const result = getMonthStart();
      const date = new Date(result);

      expect(date.getUTCDate()).toBe(1);
      expect(date.getUTCMonth()).toBe(0);

      vi.useRealTimers();
    });
  });

  describe("getTodayISO", () => {
    beforeEach(() => {
      vi.useRealTimers();
    });

    test("returns today's date as ISO string", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-01-15T12:00:00.000Z"));

      const result = getTodayISO();
      const date = new Date(result);

      expect(date.getUTCDate()).toBe(15);
      expect(date.getUTCMonth()).toBe(0); // January
      expect(date.getUTCFullYear()).toBe(2025);

      vi.useRealTimers();
    });

    test("sets time to end of day (23:59:59.999)", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-01-15T00:00:00.000Z"));

      const result = getTodayISO();
      const date = new Date(result);

      expect(date.getUTCHours()).toBe(23);
      expect(date.getUTCMinutes()).toBe(59);
      expect(date.getUTCSeconds()).toBe(59);
      expect(date.getUTCMilliseconds()).toBe(999);

      vi.useRealTimers();
    });

    test("returns valid ISO string format", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-01-15T12:00:00.000Z"));

      const result = getTodayISO();

      // Should be a valid ISO string
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

      vi.useRealTimers();
    });

    test("preserves date even at midnight", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-01-15T00:00:00.000Z"));

      const result = getTodayISO();
      const date = new Date(result);

      // Should still be Jan 15, not Jan 16
      expect(date.getUTCDate()).toBe(15);
      expect(date.getUTCMonth()).toBe(0);

      vi.useRealTimers();
    });
  });
});
