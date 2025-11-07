/**
 * Formatuje datę po polsku w formacie "DD MMMM YYYY"
 * @param dateString - Data w formacie ISO string lub Date object
 * @returns Sformatowana data po polsku lub null jeśli brak daty
 */
export function formatDatePL(dateString: string | Date | null | undefined): string | null {
  if (!dateString) return null;
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Sprawdź czy data jest poprawna
  if (isNaN(date.getTime())) return null;
  
  const monthsPL = [
    'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
    'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
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
  return formatted || 'Jeszcze nie zacząłeś';
}

