/**
 * Rate limiting for API endpoints
 * 
 * Simple in-memory rate limiter (for production, use Redis or similar)
 */

interface RateLimitConfig {
  windowMs: number; // Okno czasowe w milisekundach
  maxRequests: number; // Maksymalna liczba requestów w oknie
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (w produkcji użyj Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Konfiguracja dla różnych endpointów
export const RATE_LIMITS = {
  generateFlashcards: {
    windowMs: 60 * 1000, // 1 minuta
    maxRequests: 10, // 10 requestów na minutę
  },
  generateFlashcardsHourly: {
    windowMs: 60 * 60 * 1000, // 1 godzina
    maxRequests: 100, // 100 requestów na godzinę
  },
  generateFlashcardsDaily: {
    windowMs: 24 * 60 * 60 * 1000, // 1 dzień
    maxRequests: 500, // 500 requestów na dzień
  },
} as const;

/**
 * Sprawdź czy request jest dozwolony
 */
export function checkRateLimit(
  userId: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const key = `${userId}:${config.windowMs}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Jeśli nie ma wpisu lub okno się zresetowało
  if (!entry || now >= entry.resetAt) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, newEntry);
    
    // Cleanup starych wpisów (co 1000 requestów)
    if (rateLimitStore.size > 1000) {
      cleanupExpiredEntries();
    }

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: newEntry.resetAt,
    };
  }

  // Jeśli limit został przekroczony
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Zwiększ licznik
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Wyczyść wygasłe wpisy
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Sprawdź wszystkie limity dla użytkownika
 */
export function checkAllRateLimits(userId: string): {
  allowed: boolean;
  remaining: { minute: number; hour: number; day: number };
  resetAt: { minute: number; hour: number; day: number };
} {
  const minute = checkRateLimit(userId, RATE_LIMITS.generateFlashcards);
  const hour = checkRateLimit(userId, RATE_LIMITS.generateFlashcardsHourly);
  const day = checkRateLimit(userId, RATE_LIMITS.generateFlashcardsDaily);

  const allowed = minute.allowed && hour.allowed && day.allowed;

  return {
    allowed,
    remaining: {
      minute: minute.remaining,
      hour: hour.remaining,
      day: day.remaining,
    },
    resetAt: {
      minute: minute.resetAt,
      hour: hour.resetAt,
      day: day.resetAt,
    },
  };
}

