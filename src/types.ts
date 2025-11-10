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

// Typy dla systemu wersjonowania
export interface VersionResponse {
  version: string;
  date?: string;
  build?: string;
}

export interface VersionInfo {
  version: string;
  date: string;
  number: number;
}
