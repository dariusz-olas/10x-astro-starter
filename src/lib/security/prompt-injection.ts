/**
 * Security module for detecting and preventing prompt injection attacks
 *
 * This module provides:
 * - Input validation and sanitization
 * - Prompt injection pattern detection
 * - Response validation
 * - Rate limiting helpers
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedText?: string;
}

export interface SecurityConfig {
  maxLength: number;
  minLength: number;
  maxLines: number;
  enableStrictMode: boolean;
}

const DEFAULT_CONFIG: SecurityConfig = {
  maxLength: 10000, // 10k znaków
  minLength: 10, // Minimum 10 znaków
  maxLines: 200, // Max 200 linii
  enableStrictMode: true,
};

/**
 * Wzorce prompt injection - podstawowe
 */
const PROMPT_INJECTION_PATTERNS = [
  // Ignore instructions
  /ignore\s+(previous|all|the)\s+(instructions?|prompts?|commands?)/i,
  /forget\s+(previous|all|the)\s+(instructions?|prompts?|commands?)/i,
  /disregard\s+(previous|all|the)\s+(instructions?|prompts?|commands?)/i,
  /override\s+(previous|all|the)\s+(instructions?|prompts?|commands?)/i,

  // System prompt extraction
  /(show|reveal|display|print|output|tell\s+me)\s+(the\s+)?(system\s+)?(prompt|instructions?|commands?)/i,
  /what\s+(are\s+)?(the\s+)?(system\s+)?(prompt|instructions?|commands?)/i,
  /repeat\s+(the\s+)?(system\s+)?(prompt|instructions?|commands?)/i,

  // Jailbreak attempts
  /you\s+are\s+now\s+(dan|jailbroken|unrestricted|unfiltered)/i,
  /(roleplay|pretend|act\s+as|you\s+are)\s+(a\s+)?(different|new|evil|malicious|unrestricted|unfiltered)/i,
  /roleplay.*(different|new|evil|malicious)/i, // Dodatkowy wzorzec dla "roleplay as a different"
  /jailbreak|bypass|hack|exploit/i,

  // Command injection
  /(execute|run|eval|system|shell|command)/i,
  /<script|javascript:|onerror=|onload=/i,

  // Data exfiltration
  /(repeat|echo|output|return)\s+(all|every|the)\s+(previous|earlier|above)/i,
  /(show|reveal|display)\s+(all|every|the)\s+(data|information|content)/i,

  // Token manipulation
  /(max|maximum|increase)\s+(tokens?|length|size)/i,
  /(generate|create|make)\s+(as\s+)?(many|more|longer)/i,
];

/**
 * Wzorce podejrzanych sekwencji
 */
const SUSPICIOUS_PATTERNS = [
  // Zbyt dużo specjalnych znaków
  // eslint-disable-next-line no-useless-escape
  /[\[\]{}]{5,}/, // 5+ nawiasów kwadratowych/kręconych
  /[<>]{5,}/, // 5+ nawiasów trójkątnych
  /[|\\/]{10,}/, // 10+ znaków | lub \

  // Powtarzające się sekwencje (może być atakiem)
  /(.{10,})\1{3,}/, // Powtarzająca się sekwencja 4+ razy

  // Zbyt dużo białych znaków
  /\s{20,}/, // 20+ białych znaków z rzędu
];

/**
 * Walidacja i sanityzacja inputu użytkownika
 */
export function validateAndSanitizeInput(text: string, config: Partial<SecurityConfig> = {}): ValidationResult {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedText = text;

  // 1. Sprawdź czy tekst nie jest pusty
  if (!text || typeof text !== "string") {
    return {
      isValid: false,
      errors: ["Tekst nie może być pusty"],
      warnings: [],
    };
  }

  // 2. Sprawdź minimalną długość
  if (text.trim().length < finalConfig.minLength) {
    errors.push(`Tekst musi mieć minimum ${finalConfig.minLength} znaków`);
  }

  // 3. Sprawdź maksymalną długość
  if (text.length > finalConfig.maxLength) {
    errors.push(`Tekst nie może przekraczać ${finalConfig.maxLength} znaków`);
    sanitizedText = text.substring(0, finalConfig.maxLength);
  }

  // 4. Sprawdź liczbę linii
  const lines = text.split("\n");
  if (lines.length > finalConfig.maxLines) {
    errors.push(`Tekst nie może mieć więcej niż ${finalConfig.maxLines} linii`);
    sanitizedText = lines.slice(0, finalConfig.maxLines).join("\n");
  }

  // 5. Wykryj wzorce prompt injection
  const detectedPatterns: string[] = [];
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      detectedPatterns.push(pattern.source);
      if (finalConfig.enableStrictMode) {
        errors.push("Wykryto podejrzaną zawartość w tekście");
      } else {
        warnings.push("Wykryto podejrzaną zawartość w tekście");
      }
    }
  }

  // 6. Wykryj podejrzane sekwencje
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(text)) {
      warnings.push("Wykryto podejrzane sekwencje znaków");
    }
  }

  // 7. Sanityzacja (jeśli nie ma krytycznych błędów)
  if (errors.length === 0 || !finalConfig.enableStrictMode) {
    // Normalizuj białe znaki (zachowaj pojedyncze spacje i nowe linie)
    sanitizedText = sanitizedText
      .replace(/\r\n/g, "\n") // Normalizuj line endings
      .replace(/\r/g, "\n")
      .replace(/[ \t]+/g, " ") // Zastąp wiele spacji/tabulacji jedną spacją
      .replace(/\n{3,}/g, "\n\n"); // Max 2 nowe linie z rzędu

    // Usuń kontrolne znaki (zachowaj \n, \t)
    // eslint-disable-next-line no-control-regex
    sanitizedText = sanitizedText.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "");

    // Trim
    sanitizedText = sanitizedText.trim();
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedText: errors.length === 0 || !finalConfig.enableStrictMode ? sanitizedText : undefined,
  };
}

/**
 * Escapowanie delimiterów w tekście użytkownika
 * Zapobiega prompt injection przez escapowanie specjalnych sekwencji
 */
export function escapeUserInput(text: string): string {
  // Escapuj sekwencje, które mogą być interpretowane jako instrukcje
  return text
    .replace(/\n/g, "\\n") // Escapuj nowe linie
    .replace(/"/g, '\\"') // Escapuj cudzysłowy
    .replace(/{/g, "\\{") // Escapuj nawiasy klamrowe
    .replace(/}/g, "\\}") // Escapuj nawiasy klamrowe
    .replace(/\[/g, "\\[") // Escapuj nawiasy kwadratowe
    .replace(/\]/g, "\\]"); // Escapuj nawiasy kwadratowe
}

/**
 * Walidacja odpowiedzi z AI
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateAIResponse(response: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Sprawdź czy odpowiedź jest obiektem
  if (!response || typeof response !== "object") {
    return {
      isValid: false,
      errors: ["Nieprawidłowy format odpowiedzi z AI"],
      warnings: [],
    };
  }

  // 2. Sprawdź czy ma wymagane pole flashcards
  if (!response.flashcards || !Array.isArray(response.flashcards)) {
    return {
      isValid: false,
      errors: ["Brak wymaganego pola 'flashcards' w odpowiedzi"],
      warnings: [],
    };
  }

  // 3. Sprawdź czy flashcards nie jest puste
  if (response.flashcards.length === 0) {
    errors.push("Brak fiszek w odpowiedzi");
  }

  // 4. Sprawdź czy nie ma zbyt wielu fiszek (może być atakiem)
  if (response.flashcards.length > 50) {
    warnings.push("Zbyt duża liczba fiszek w odpowiedzi");
  }

  // 5. Waliduj każdą fiszkę
  for (let i = 0; i < response.flashcards.length; i++) {
    const card = response.flashcards[i];

    if (!card || typeof card !== "object") {
      errors.push(`Fiszka ${i + 1} ma nieprawidłowy format`);
      continue;
    }

    // Sprawdź wymagane pola
    if (!card.front || typeof card.front !== "string") {
      errors.push(`Fiszka ${i + 1} nie ma pola 'front'`);
    }
    if (!card.back || typeof card.back !== "string") {
      errors.push(`Fiszka ${i + 1} nie ma pola 'back'`);
    }

    // Sprawdź długość pól
    if (card.front && card.front.length > 500) {
      warnings.push(`Fiszka ${i + 1} ma zbyt długie pole 'front' (${card.front.length} znaków)`);
    }
    if (card.back && card.back.length > 500) {
      warnings.push(`Fiszka ${i + 1} ma zbyt długie pole 'back' (${card.back.length} znaków)`);
    }

    // Sprawdź czy nie zawiera podejrzanych treści
    const combinedText = `${card.front} ${card.back}`;
    for (const pattern of PROMPT_INJECTION_PATTERNS) {
      if (pattern.test(combinedText)) {
        warnings.push(`Fiszka ${i + 1} może zawierać podejrzane treści`);
      }
    }

    // Sprawdź czy nie ma dodatkowych pól (może być próba injection)
    const allowedFields = ["front", "back"];
    const extraFields = Object.keys(card).filter((key) => !allowedFields.includes(key));
    if (extraFields.length > 0) {
      warnings.push(`Fiszka ${i + 1} ma dodatkowe pola: ${extraFields.join(", ")}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Sprawdź czy tekst zawiera potencjalny prompt injection
 */
export function detectPromptInjection(text: string): boolean {
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return true;
    }
  }
  return false;
}

/**
 * Oblicz "score" bezpieczeństwa tekstu (0-100, wyższy = bezpieczniejszy)
 */
export function calculateSecurityScore(text: string): number {
  let score = 100;

  // Odejmij punkty za wykryte wzorce
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      score -= 20;
    }
  }

  // Odejmij punkty za podejrzane sekwencje
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(text)) {
      score -= 10;
    }
  }

  // Odejmij punkty za zbyt długi tekst
  if (text.length > 5000) {
    score -= 10;
  }

  // Odejmij punkty za zbyt wiele linii
  if (text.split("\n").length > 100) {
    score -= 10;
  }

  return Math.max(0, score);
}
