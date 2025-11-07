export type Grade = 0 | 1 | 2 | 3;

export interface SchedulingState {
  ease: number;
  intervalDays: number;
  repetitions: number;
}

export interface GradeInput extends SchedulingState {
  grade: Grade;
}

export interface GradeResult {
  nextEase: number;
  nextIntervalDays: number;
  nextRepetitions: number;
}

/**
 * Algorytm SM-2 lite: oblicza nowy stan harmonogramu na podstawie oceny
 * 
 * Oceny:
 * - 0 (Again): Reset repetitions, zmniejsz ease o 20
 * - 1 (Hard): Zwiększ repetitions, mały interval
 * - 2 (Good): Zwiększ repetitions, normalny interval (główny flow)
 * - 3 (Easy): Zwiększ repetitions, duży interval, zwiększ ease
 */
export function gradeAnswer(input: GradeInput): GradeResult {
  const { ease, intervalDays, repetitions, grade } = input;
  const minEase = 130;

  // Ocena < 2 (Again lub Hard): reset repetitions, zmniejsz ease
  if (grade < 2) {
    const nextEase = Math.max(minEase, ease - 20);
    return { nextEase, nextIntervalDays: 1, nextRepetitions: 0 };
  }

  // Ocena >= 2 (Good lub Easy): zwiększ repetitions i ease
  const delta = grade - 2; // 0 dla Good, 1 dla Easy
  const nextEase = Math.max(minEase, ease + delta * 10);
  const nextRepetitions = repetitions + 1;

  let nextIntervalDays: number;
  if (nextRepetitions === 1) {
    nextIntervalDays = 1;
  } else if (nextRepetitions === 2) {
    nextIntervalDays = 3;
  } else {
    // Dla repetitions > 2: interval = poprzedni_interval * (ease / 100)
    nextIntervalDays = Math.max(1, Math.round(intervalDays * (nextEase / 100)));
  }

  return { nextEase, nextIntervalDays, nextRepetitions };
}

/**
 * Oblicza datę następnej powtórki na podstawie liczby dni
 */
export function nextDueAt(intervalDays: number, from: Date = new Date()): Date {
  const due = new Date(from.getTime());
  due.setUTCDate(due.getUTCDate() + Math.max(0, intervalDays));
  return due;
}

