# Przewodnik Developmentu

## Środowiska Developmentowe

### WSL2 vs Windows

Projekt może być rozwijany zarówno w **WSL2** (Windows Subsystem for Linux) jak i natywnie w **Windows**. Oto kluczowe różnice i najlepsze praktyki:

#### Kiedy używać WSL2?

- ✅ Windows ARM64 (problemy z Cloudflare adapter)
- ✅ Potrzebujesz pełnej kompatybilności z Linux (produkcja działa na Linux)
- ✅ Chcesz uniknąć problemów z `workerd` dependency

#### Kiedy używać Windows?

- ✅ Windows x64 (wszystko działa natywnie)
- ✅ Szybszy dostęp do plików (bez warstwy WSL2)
- ✅ Lepsza integracja z narzędziami Windows

### Ważne zasady

**⚠️ NIE mieszaj środowisk w jednej sesji!**

- Jeśli uruchomiłeś `npm run dev` w WSL2, kontynuuj w WSL2
- Jeśli uruchomiłeś w Windows, kontynuuj w Windows
- Mieszanie może powodować problemy z cache i błędami kompilacji

### Cache i pliki tymczasowe

#### Lokalizacje cache:

**WSL2:**
- `.astro/` - cache Astro (w katalogu projektu)
- `node_modules/.vite/` - cache Vite
- `logs/` - logi aplikacji (w katalogu projektu)
- `dist/` - build output

**Windows:**
- `.astro/` - cache Astro (w katalogu projektu)
- `node_modules/.vite/` - cache Vite
- `logs/` - logi aplikacji (w katalogu projektu)
- `dist/` - build output

**Uwaga:** Cache jest **różny** dla każdego środowiska! Jeśli przełączasz się między WSL2 a Windows, zawsze wyczyść cache.

#### Czyszczenie cache:

```bash
# W WSL2 lub Windows (PowerShell)
npm run clean:cache

# Lub ręcznie w WSL2:
rm -rf .astro node_modules/.vite dist

# Lub ręcznie w Windows PowerShell:
Remove-Item -Recurse -Force .astro, node_modules\.vite, dist -ErrorAction SilentlyContinue
```

### Rozwiązywanie problemów

#### Problem: "Cannot access 'X' before initialization"

**Przyczyna:** Stary cache z poprzedniego środowiska

**Rozwiązanie:**
```bash
npm run clean:cache
# Zrestartuj serwer dev
npm run dev
```

#### Problem: Błędy kompilacji po zmianie środowiska

**Przyczyna:** Cache z innego środowiska

**Rozwiązanie:**
```bash
# Wyczyść cache
npm run clean:cache

# Opcjonalnie: wyczyść też node_modules (jeśli problemy z zależnościami)
rm -rf node_modules package-lock.json
npm install

# Uruchom ponownie
npm run dev
```

#### Problem: Różne ścieżki w komunikatach błędów

**Przyczyna:** Normalne - WSL2 pokazuje `/mnt/c/...`, Windows pokazuje `C:\...`

**Rozwiązanie:** To nie jest problem - kod używa względnych ścieżek, więc działa w obu środowiskach

### Najlepsze praktyki

1. **Wybierz jedno środowisko** i trzymaj się go w całej sesji developmentu
2. **Po zmianie środowiska** zawsze wyczyść cache: `npm run clean:cache`
3. **Po błędach kompilacji** wyczyść cache przed szukaniem innych przyczyn
4. **Używaj skryptów npm** zamiast ręcznych komend - są cross-platform
5. **Sprawdzaj logi** w `logs/` - są tworzone w środowisku, w którym działa aplikacja

### Skrypty pomocnicze

```bash
# Wyczyść cache (działa w WSL2 i Windows)
npm run clean:cache

# Wyczyść wszystko (cache + node_modules)
npm run clean:all

# Po clean:all, zainstaluj ponownie:
npm install
```

### Synchronizacja plików

- ✅ Pliki źródłowe (`src/`) są współdzielone między Windows i WSL2
- ✅ `.env` jest współdzielony
- ✅ `package.json` jest współdzielony
- ❌ Cache (`.astro/`, `node_modules/.vite/`) jest **różny** dla każdego środowiska
- ❌ `node_modules/` może być różny (ale zwykle działa)

### Wskazówki dla AI Assistants

Jeśli używasz AI assistant (jak Cursor AI), który działa w Windows, a aplikacja działa w WSL2:

1. **Informuj AI o środowisku** - powiedz "aplikacja działa w WSL2"
2. **Sprawdzaj cache** - jeśli AI sugeruje zmiany, które nie działają, wyczyść cache
3. **Używaj względnych ścieżek** - kod używa `logs/` zamiast `C:\...` lub `/mnt/c/...`
4. **Weryfikuj w odpowiednim środowisku** - testuj zmiany w środowisku, w którym działa aplikacja

### Przykładowy workflow

```bash
# 1. Rozpocznij sesję w WSL2
cd /mnt/c/laragon/www/10x-astro-starter

# 2. Wyczyść cache (jeśli przełączasz się z Windows)
npm run clean:cache

# 3. Uruchom serwer dev
npm run dev

# 4. Wprowadzaj zmiany w kodzie (w Windows IDE lub WSL2)

# 5. Jeśli widzisz błędy kompilacji:
npm run clean:cache
# Zrestartuj serwer

# 6. Na końcu sesji - opcjonalnie wyczyść cache
npm run clean:cache
```

### Troubleshooting

**Q: Czy mogę używać Windows IDE (VS Code) z WSL2?**
A: Tak! VS Code ma doskonałą integrację z WSL2. Otwórz folder przez WSL2 w VS Code.

**Q: Czy cache z Windows będzie działał w WSL2?**
A: Nie. Cache jest specyficzny dla środowiska. Zawsze wyczyść cache po zmianie środowiska.

**Q: Czy logi są współdzielone?**
A: Tak, logi w `logs/` są współdzielone, ale są tworzone w środowisku, w którym działa aplikacja.

**Q: Jak sprawdzić, w którym środowisku działa aplikacja?**
A: Sprawdź ścieżki w komunikatach błędów lub logach. WSL2 pokazuje `/mnt/c/...`, Windows pokazuje `C:\...`.

