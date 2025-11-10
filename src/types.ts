// Typy dla fiszek
export interface Flashcard {
  id: string;
  user_id: string;
  front: string;
  back: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// DTO dla tworzenia/aktualizacji fiszki
export interface FlashcardCreateDTO {
  front: string;
  back: string;
  tags?: string[];
}

export interface FlashcardUpdateDTO {
  front?: string;
  back?: string;
  tags?: string[];
}

// Typy dla harmonogramu powtórek
export interface CardScheduling {
  card_id: string;
  user_id: string;
  ease: number;
  interval_days: number;
  repetitions: number;
  due_at: string | null;
  updated_at: string;
}

// Typy dla historii ocen
export interface CardReview {
  id: string;
  user_id: string;
  card_id: string;
  reviewed_at: string;
  grade: number; // 0-3: Again, Hard, Good, Easy
  prev_interval_days: number | null;
  new_interval_days: number | null;
  prev_ease: number | null;
  new_ease: number | null;
}

// Typy dla sesji powtórek
export interface ReviewSession {
  id: string;
  user_id: string;
  completed_at: string;
  cards_reviewed: number;
  cards_correct: number;
  accuracy: number;
}

// Typy dla statystyk dashboard
export interface DashboardStats {
  // Obecne podstawowe statystyki
  totalCards: number;
  lastReview: string | null;
  accuracy: number; // poprawność ostatniej sesji
  mostUsedTags: string[];

  // Nowe - Statystyki powtórek
  totalReviews: number; // łączna liczba powtórek
  averageAccuracy: number; // średnia poprawność ze wszystkich sesji
  longestStreak: number; // najdłuższa seria dni z powtórkami
  cardsDueToday: number; // fiszki do powtórki dzisiaj

  // Nowe - Statystyki algorytmu SM-2
  averageEase: number; // średni ease factor
  averageInterval: number; // średni interwał powtórek (dni)
  newCards: number; // fiszki nowe (repetitions = 0)
  learningCards: number; // fiszki w nauce (repetitions > 0, interval < 30)
  masteredCards: number; // fiszki opanowane (interval >= 30)

  // Nowe - Statystyki czasowe
  cardsAddedThisWeek: number; // fiszki dodane w tym tygodniu
  cardsAddedThisMonth: number; // fiszki dodane w tym miesiącu
  activeDaysLast7Days: number; // dni z aktywnością w ostatnich 7 dniach
  activeDaysLast30Days: number; // dni z aktywnością w ostatnich 30 dniach
  mostActiveDayOfWeek: string | null; // najaktywniejszy dzień tygodnia

  // Dane dla wykresów (Faza 2)
  activityChartData?: ActivityChartData[]; // aktywność w ostatnich 30 dniach
  accuracyChartData?: AccuracyChartData[]; // poprawność w ostatnich 10 sesjach
  cardsDistribution?: CardsDistributionData[]; // rozkład fiszek
  tagDistribution?: TagDistributionData[]; // top 5 tagów
}

// Typy dla historii powtórek (dla przyszłych faz)
export interface ReviewHistoryItem {
  id: string;
  completedAt: string;
  cardsReviewed: number;
  cardsCorrect: number;
  accuracy: number;
}

// Typy dla statystyk per tag (dla przyszłych faz)
export interface TagStat {
  tag: string;
  cardCount: number;
  averageAccuracy: number;
  lastReview: string | null;
  cardsDue: number;
}

// Typy dla wykresów (Faza 2)
export interface ActivityChartData {
  date: string; // YYYY-MM-DD
  reviews: number; // liczba powtórek tego dnia
}

export interface AccuracyChartData {
  session: string; // np. "Sesja 1"
  accuracy: number; // procent poprawności (0-100)
  date: string; // data sesji dla tooltipa
}

export interface CardsDistributionData {
  name: string; // "Nowe", "W nauce", "Opanowane"
  value: number; // liczba fiszek
  fill: string; // kolor
}

export interface TagDistributionData {
  tag: string;
  count: number; // liczba fiszek z tym tagiem
}
