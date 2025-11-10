import { describe, test, expect } from "vitest";
import {
  formatDatePL,
  formatDateOrDefault,
  getWeekStart,
  getMonthStart,
  getTodayISO,
} from "./dateUtils";

describe("dateUtils", () => {
  describe("formatDatePL", () => {
    test("formatuje datę po polsku", () => {
      const date = new Date("2025-01-15T10:00:00Z");
      expect(formatDatePL(date)).toBe("15 stycznia 2025");
    });

    test("formatuje datę z ISO string", () => {
      expect(formatDatePL("2025-03-20T10:00:00Z")).toBe("20 marca 2025");
    });

    test("zwraca null dla null", () => {
      expect(formatDatePL(null)).toBeNull();
    });

    test("zwraca null dla undefined", () => {
      expect(formatDatePL(undefined)).toBeNull();
    });

    test("zwraca null dla nieprawidłowej daty", () => {
      expect(formatDatePL("invalid-date")).toBeNull();
    });
  });

  describe("formatDateOrDefault", () => {
    test("zwraca sformatowaną datę", () => {
      expect(formatDateOrDefault("2025-01-15T10:00:00Z")).toBe("15 stycznia 2025");
    });

    test("zwraca domyślny tekst dla null", () => {
      expect(formatDateOrDefault(null)).toBe("Jeszcze nie zacząłeś");
    });
  });

  describe("getWeekStart", () => {
    test("zwraca datę początku tygodnia (poniedziałek)", () => {
      const weekStart = getWeekStart();
      const date = new Date(weekStart);
      expect(date.getDay()).toBe(1); // Poniedziałek
    });

    test("zwraca ISO string", () => {
      const weekStart = getWeekStart();
      expect(typeof weekStart).toBe("string");
      expect(weekStart).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe("getMonthStart", () => {
    test("zwraca datę początku miesiąca", () => {
      const monthStart = getMonthStart();
      const date = new Date(monthStart);
      expect(date.getDate()).toBe(1); // Pierwszy dzień miesiąca
    });

    test("zwraca ISO string", () => {
      const monthStart = getMonthStart();
      expect(typeof monthStart).toBe("string");
      expect(monthStart).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe("getTodayISO", () => {
    test("zwraca dzisiejszą datę jako ISO string", () => {
      const today = getTodayISO();
      expect(typeof today).toBe("string");
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    test("zwraca datę z końcem dnia (23:59:59)", () => {
      const today = getTodayISO();
      const date = new Date(today);
      expect(date.getHours()).toBe(23);
      expect(date.getMinutes()).toBe(59);
      expect(date.getSeconds()).toBe(59);
    });
  });
});
