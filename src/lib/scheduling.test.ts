import { describe, test, expect } from 'vitest';
import { gradeAnswer, nextDueAt } from './scheduling';

describe('scheduling', () => {
  describe('gradeAnswer', () => {
    test('again (0) resets repetitions and sets 1 day', () => {
      const result = gradeAnswer({ ease: 250, intervalDays: 10, repetitions: 5, grade: 0 });
      expect(result.nextRepetitions).toBe(0);
      expect(result.nextIntervalDays).toBe(1);
      expect(result.nextEase).toBe(230); // 250 - 20
    });

    test('hard (1) resets repetitions and sets 1 day', () => {
      const result = gradeAnswer({ ease: 250, intervalDays: 10, repetitions: 5, grade: 1 });
      expect(result.nextRepetitions).toBe(0);
      expect(result.nextIntervalDays).toBe(1);
      expect(result.nextEase).toBe(230); // 250 - 20
    });

    test('good (2) increases repetitions and grows interval', () => {
      // Pierwsza powtórka (repetitions = 0)
      const r1 = gradeAnswer({ ease: 250, intervalDays: 0, repetitions: 0, grade: 2 });
      expect(r1.nextRepetitions).toBe(1);
      expect(r1.nextIntervalDays).toBe(1);
      expect(r1.nextEase).toBe(250); // Good nie zmienia ease

      // Druga powtórka (repetitions = 1)
      const r2 = gradeAnswer({
        ease: r1.nextEase,
        intervalDays: r1.nextIntervalDays,
        repetitions: r1.nextRepetitions,
        grade: 2
      });
      expect(r2.nextRepetitions).toBe(2);
      expect(r2.nextIntervalDays).toBe(3);
      expect(r2.nextEase).toBe(250);

      // Trzecia powtórka (repetitions = 2)
      const r3 = gradeAnswer({
        ease: r2.nextEase,
        intervalDays: r2.nextIntervalDays,
        repetitions: r2.nextRepetitions,
        grade: 2
      });
      expect(r3.nextRepetitions).toBe(3);
      expect(r3.nextIntervalDays).toBeGreaterThanOrEqual(3); // interval * (ease / 100)
      expect(r3.nextEase).toBe(250);
    });

    test('easy (3) increases repetitions, large interval, and increases ease', () => {
      const result = gradeAnswer({ ease: 250, intervalDays: 10, repetitions: 5, grade: 3 });
      expect(result.nextRepetitions).toBe(6);
      expect(result.nextIntervalDays).toBeGreaterThanOrEqual(10);
      expect(result.nextEase).toBe(260); // 250 + 10
    });

    test('ease does not drop below 130', () => {
      const result = gradeAnswer({ ease: 130, intervalDays: 5, repetitions: 3, grade: 0 });
      expect(result.nextEase).toBe(130); // Minimum ease
    });

    test('ease can increase above 250', () => {
      const result = gradeAnswer({ ease: 250, intervalDays: 10, repetitions: 5, grade: 3 });
      expect(result.nextEase).toBe(260);
    });
  });

  describe('nextDueAt', () => {
    test('adds days in UTC', () => {
      const base = new Date(Date.UTC(2025, 0, 1)); // 1 stycznia 2025
      const due = nextDueAt(3, base);
      expect(due.toISOString().startsWith('2025-01-04')).toBe(true);
    });

    test('handles zero days', () => {
      const base = new Date(Date.UTC(2025, 0, 1));
      const due = nextDueAt(0, base);
      expect(due.toISOString().startsWith('2025-01-01')).toBe(true);
    });

    test('handles negative days (clamps to 0)', () => {
      const base = new Date(Date.UTC(2025, 0, 1));
      const due = nextDueAt(-5, base);
      expect(due.toISOString().startsWith('2025-01-01')).toBe(true);
    });

    test('uses current date if not provided', () => {
      const before = new Date();
      const due = nextDueAt(1);
      const after = new Date();
      
      // Sprawdź czy data jest między before a after + 1 dzień
      expect(due.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(due.getTime()).toBeLessThanOrEqual(after.getTime() + 24 * 60 * 60 * 1000);
    });
  });
});

