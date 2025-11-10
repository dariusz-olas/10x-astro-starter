import type { ReviewSession } from "../types";

/**
 * Oblicza najdłuższą serię dni z powtórkami
 * @param sessions - Lista sesji powtórek posortowana po dacie (rosnąco)
 * @returns Liczba dni w najdłuższej serii
 */
export function calculateStreak(sessions: ReviewSession[]): number {
  if (!sessions || sessions.length === 0) return 0;

  // Grupuj sesje po datach (bez czasu) z walidacją
  const uniqueDates = new Set<string>();
  for (const session of sessions) {
    const date = new Date(session.completed_at);

    // Walidacja daty - pomiń nieprawidłowe daty
    if (isNaN(date.getTime())) {
      continue;
    }

    const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
    uniqueDates.add(dateStr);
  }

  // Konwertuj na posortowaną tablicę dat
  const sortedDates = Array.from(uniqueDates)
    .map((d) => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime());

  if (sortedDates.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = sortedDates[i - 1];
    const currDate = sortedDates[i];

    // Oblicz różnicę w dniach
    const diffMs = currDate.getTime() - prevDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Kolejny dzień
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      // Przerwana seria
      currentStreak = 1;
    }
  }

  return maxStreak;
}

/**
 * Znajduje najaktywniejszy dzień tygodnia na podstawie sesji powtórek
 * @param sessions - Lista sesji powtórek
 * @returns Nazwa dnia po polsku lub null jeśli brak sesji
 */
export function getMostActiveDay(sessions: ReviewSession[]): string | null {
  if (!sessions || sessions.length === 0) return null;

  const daysPL = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];

  // Zlicz sesje dla każdego dnia tygodnia (0 = Niedziela, 6 = Sobota) z walidacją
  const dayCounts: Record<number, number> = {};

  for (const session of sessions) {
    const date = new Date(session.completed_at);

    // Walidacja daty - pomiń nieprawidłowe daty
    if (isNaN(date.getTime())) {
      continue;
    }

    const dayOfWeek = date.getDay(); // 0-6
    dayCounts[dayOfWeek] = (dayCounts[dayOfWeek] || 0) + 1;
  }

  // Znajdź dzień z największą liczbą sesji
  let maxCount = 0;
  let mostActiveDay = 0;

  for (const [day, count] of Object.entries(dayCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostActiveDay = parseInt(day);
    }
  }

  return maxCount > 0 ? daysPL[mostActiveDay] : null;
}

/**
 * Grupuje powtórki po datach i zwraca obiekt z liczbą powtórek dla każdego dnia
 * @param reviews - Lista powtórek z datami
 * @returns Obiekt {data: liczba_powtórek}
 */
export function groupByDate(reviews: Array<{ reviewed_at: string }>): Record<string, number> {
  const grouped: Record<string, number> = {};

  for (const review of reviews) {
    const date = new Date(review.reviewed_at);
    const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
    grouped[dateStr] = (grouped[dateStr] || 0) + 1;
  }

  return grouped;
}

/**
 * Zlicza unikalne dni z aktywnością w danym okresie
 * @param sessions - Lista sesji powtórek
 * @param days - Liczba dni wstecz do sprawdzenia
 * @returns Liczba unikalnych dni z aktywnością
 */
export function countActiveDays(sessions: ReviewSession[], days: number): number {
  if (!sessions || sessions.length === 0) return 0;

  const now = new Date();
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const activeDates = new Set<string>();

  for (const session of sessions) {
    const sessionDate = new Date(session.completed_at);
    if (sessionDate >= cutoffDate) {
      const dateStr = sessionDate.toISOString().split("T")[0];
      activeDates.add(dateStr);
    }
  }

  return activeDates.size;
}

/**
 * Bezpieczne obliczanie średniej z tablicy liczb
 * @param values - Tablica wartości
 * @returns Średnia lub 0 jeśli tablica pusta
 */
export function safeAverage(values: number[]): number {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Zaokrągla liczbę do określonej liczby miejsc dziesiętnych
 * @param value - Wartość do zaokrąglenia
 * @param decimals - Liczba miejsc dziesiętnych (domyślnie 2)
 * @returns Zaokrąglona wartość
 */
export function roundTo(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}
