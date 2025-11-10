/**
 * Formatuje datę po polsku w formacie "DD MMMM YYYY"
 * @param dateString - Data w formacie ISO string lub Date object
 * @returns Sformatowana data po polsku lub null jeśli brak daty
 */
export function formatDatePL(dateString: string | Date | null | undefined): string | null {
  if (!dateString) return null;

  const date = typeof dateString === "string" ? new Date(dateString) : dateString;

  // Sprawdź czy data jest poprawna
  if (isNaN(date.getTime())) return null;

  const monthsPL = [
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

  const day = date.getDate();
  const month = monthsPL[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Zwraca tekst domyślny gdy brak daty
 * @param dateString - Data do sprawdzenia
 * @returns Sformatowana data lub "Jeszcze nie zacząłeś"
 */
export function formatDateOrDefault(dateString: string | Date | null | undefined): string {
  const formatted = formatDatePL(dateString);
  return formatted || "Jeszcze nie zacząłeś";
}

/**
 * Zwraca datę początku tygodnia (poniedziałek) dla obecnego tygodnia
 * @returns Data początku tygodnia jako ISO string
 */
export function getWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = niedziela, 1 = poniedziałek, ...
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Poniedziałek jako początek tygodnia
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart.toISOString();
}

/**
 * Zwraca datę początku miesiąca dla obecnego miesiąca
 * @returns Data początku miesiąca jako ISO string
 */
export function getMonthStart(): string {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  monthStart.setHours(0, 0, 0, 0);
  return monthStart.toISOString();
}

/**
 * Zwraca aktualną datę jako ISO string (bez czasu)
 * @returns Dzisiejsza data jako ISO string
 */
export function getTodayISO(): string {
  const now = new Date();
  now.setHours(23, 59, 59, 999); // Koniec dnia
  return now.toISOString();
}
