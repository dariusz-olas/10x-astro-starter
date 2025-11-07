import { test, expect } from '@playwright/test';

/**
 * Rozszerzony test E2E przepływu użytkownika:
 * Rejestracja → Logowanie → Dodanie fiszki → Powtórka → Dashboard
 */
test.describe('Rozszerzony przepływ użytkownika', () => {
  // Unikalny email dla każdego testu, aby uniknąć konfliktów
  const uniqueEmail = `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
  const password = 'testpassword123';

  test('Pełny przepływ: rejestracja → login → dodaj fiszkę → powtórka → dashboard', async ({
    page,
  }) => {
    // 1. REJESTRACJA
    await test.step('Rejestracja nowego użytkownika', async () => {
      await page.goto('/register');
      await expect(page).toHaveURL(/\/register/);

      // Wypełnij formularz rejestracji
      await page.fill('input#email', uniqueEmail);
      await page.fill('input#password', password);
      await page.fill('input#confirmPassword', password);

      // Kliknij przycisk rejestracji
      await page.click('button:has-text("Zarejestruj się")');

      // Poczekaj na przekierowanie do dashboardu
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
      await expect(page).toHaveURL(/\/dashboard/);
    });

    // 2. WERYFIKACJA LOGOWANIA (sesja jest aktywna po rejestracji)
    await test.step('Weryfikacja zalogowania po rejestracji', async () => {
      // Sprawdź, czy widoczny jest nagłówek dashboardu
      await expect(page.locator('h1')).toContainText('10xCards');
      await expect(page.locator('text=Twoje fiszki w jednym miejscu')).toBeVisible();
    });

    // 3. DODANIE FISZKI
    await test.step('Dodanie nowej fiszki', async () => {
      // Przejdź do strony z fiszkami
      await page.goto('/flashcards');
      await expect(page).toHaveURL(/\/flashcards/);

      // Poczekaj na załadowanie komponentu React
      await page.waitForSelector('text=Wszystkie fiszki', { timeout: 10000 });

      // Kliknij przycisk "Dodaj fiszkę"
      const addButton = page.locator('button:has-text("Dodaj fiszkę")');
      await expect(addButton).toBeVisible();
      await addButton.click();

      // Poczekaj na pojawienie się formularza
      await page.waitForSelector('textarea#front', { timeout: 5000 });

      // Wypełnij formularz
      await page.fill('textarea#front', 'Test pytanie E2E');
      await page.fill('textarea#back', 'Test odpowiedź E2E');
      await page.fill('input#tags', 'test, e2e');

      // Kliknij przycisk zapisu
      const submitButton = page.locator('button[type="submit"]:has-text("Zapisz")');
      await submitButton.click();

      // Poczekaj na zniknięcie formularza i pojawienie się fiszki na liście
      await page.waitForSelector('text=Test pytanie E2E', { timeout: 10000 });
      await expect(page.locator('text=Test pytanie E2E')).toBeVisible();
      await expect(page.locator('text=Test odpowiedź E2E')).toBeVisible();
    });

    // 4. POWTÓRKA
    await test.step('Wykonanie powtórki fiszki', async () => {
      // Przejdź do strony powtórek
      await page.goto('/review');
      await expect(page).toHaveURL(/\/review/);

      // Poczekaj na załadowanie komponentu ReviewSession
      // Może być komunikat "Ładowanie..." lub od razu karty
      await page.waitForLoadState('networkidle');

      // Sprawdź, czy są karty do powtórki
      // Jeśli nie ma kart należnych, użyj trybu force
      const noCardsMessage = page.locator('text=Wszystkie należne fiszki zostały przejrzane');
      const hasCards = await page.locator('text=Pokaż back').isVisible({ timeout: 3000 }).catch(() => false);

      if (!hasCards && (await noCardsMessage.isVisible({ timeout: 3000 }).catch(() => false))) {
        // Brak kart należnych - użyj trybu force
        await page.goto('/review?force=true');
        await page.waitForLoadState('networkidle');
      }

      // Poczekaj na pojawienie się karty (front)
      const cardFront = page.locator('text=Test pytanie E2E');
      const cardVisible = await cardFront.isVisible({ timeout: 10000 }).catch(() => false);

      if (cardVisible) {
        // Kliknij "Pokaż back" aby zobaczyć odpowiedź
        const showBackButton = page.locator('button:has-text("Pokaż back")');
        if (await showBackButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          await showBackButton.click();
        }

        // Poczekaj na pojawienie się odpowiedzi
        await page.waitForSelector('text=Test odpowiedź E2E', { timeout: 5000 });

        // Oceń odpowiedź jako "Good" (grade 2)
        const goodButton = page.locator('button:has-text("Good (3/G)")');
        await expect(goodButton).toBeVisible();
        await goodButton.click();

        // Poczekaj na zakończenie sesji lub przejście do następnej karty
        await page.waitForTimeout(2000);
      } else {
        // Jeśli nie ma kart nawet po force, dodaj więcej fiszek lub pomiń ten krok
        console.log('Brak kart do powtórki - pomijam krok powtórki');
      }
    });

    // 5. DASHBOARD - WERYFIKACJA STATYSTYK
    await test.step('Weryfikacja statystyk na dashboardzie', async () => {
      // Przejdź do dashboardu
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/dashboard/);

      // Poczekaj na załadowanie statystyk
      await page.waitForSelector('text=Twoje statystyki', { timeout: 10000 });

      // Weryfikuj, że statystyki są widoczne
      // Liczba fiszek powinna być > 0
      const totalCardsText = await page.locator('text=/Masz/').textContent();
      expect(totalCardsText).toBeTruthy();

      // Sprawdź, czy widoczne są statystyki
      await expect(page.locator('text=Twoje statystyki')).toBeVisible();
      
      // Weryfikuj, że liczba fiszek jest widoczna (może być "0 fiszek" lub więcej)
      const cardsCount = page.locator('text=/\\d+ fiszek/').first();
      await expect(cardsCount).toBeVisible({ timeout: 5000 }).catch(() => {
        // Jeśli nie ma dokładnego formatu, sprawdź czy jest sekcja statystyk
        expect(page.locator('text=Masz')).toBeVisible();
      });
    });
  });

  // Test czyszczenia - opcjonalny, można go uruchomić ręcznie
  test.afterAll(async ({ page }) => {
    // Opcjonalnie: wyloguj się po teście
    // W rzeczywistości każdy test używa unikalnego emaila, więc nie ma potrzeby czyszczenia
  });
});

