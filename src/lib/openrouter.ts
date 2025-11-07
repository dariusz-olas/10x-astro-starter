interface GeneratedFlashcard {
  front: string;
  back: string;
}

interface GeneratedFlashcardsResponse {
  flashcards: GeneratedFlashcard[];
}

export async function generateFlashcards(text: string): Promise<GeneratedFlashcard[]> {
  // 🔒 SECURITY: OPENROUTER_API_KEY jest PRYWATNYM kluczem - NIGDY nie commituj go do Git!
  const apiKey = String(import.meta.env.OPENROUTER_API_KEY || '').trim();
  
  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY nie jest skonfigurowany.\n' +
        'Dodaj OPENROUTER_API_KEY do pliku .env\n' +
        'Pobierz klucz z: https://openrouter.ai/keys'
    );
  }

  if (!text || text.trim().length === 0) {
    throw new Error('Tekst nie może być pusty');
  }

  const prompt = `Na podstawie poniższego tekstu wygeneruj 5-15 fiszek edukacyjnych. 
Każda fiszka ma mieć:
- front: pytanie lub pojęcie
- back: odpowiedź lub definicja

Zwróć wynik TYLKO w formacie JSON, bez żadnych dodatkowych komentarzy:
{
  "flashcards": [
    {"front": "...", "back": "..."},
    ...
  ]
}

Tekst:
${text}`;

  const messages = [
    {
      role: 'system' as const,
      content: 'Jesteś ekspertem od tworzenia wysokiej jakości fiszek edukacyjnych. Generujesz tylko poprawny JSON bez dodatkowych komentarzy.',
    },
    {
      role: 'user' as const,
      content: prompt,
    },
  ];

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        'X-Title': '10xCards - Generator Fiszek',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini', // Budżetowy model
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `API Error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    if (!data.choices || data.choices.length === 0) {
      throw new Error('Brak odpowiedzi z API');
    }

    const content = data.choices[0].message.content.trim();

    if (!content) {
      throw new Error('Pusta odpowiedź z API');
    }

    // Wyciągnij JSON z odpowiedzi (usuwając markdown code blocks jeśli są)
    let jsonContent = content;
    if (content.includes('```json')) {
      jsonContent = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      jsonContent = content.split('```')[1].split('```')[0].trim();
    }

    // Jeśli nadal nie ma JSON, spróbuj znaleźć { na początku
    const jsonStart = jsonContent.indexOf('{');
    const jsonEnd = jsonContent.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1);
    }

    if (!jsonContent || jsonContent.length === 0) {
      throw new Error('Nie znaleziono JSON w odpowiedzi z AI');
    }

    let parsed: GeneratedFlashcardsResponse;
    try {
      parsed = JSON.parse(jsonContent);
    } catch (parseError: any) {
      throw new Error(`Błąd parsowania JSON: ${parseError.message}`);
    }

    if (!parsed.flashcards || !Array.isArray(parsed.flashcards)) {
      throw new Error('Nieprawidłowy format odpowiedzi z AI');
    }

    return parsed.flashcards;
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      throw new Error('Błąd parsowania odpowiedzi z AI. Spróbuj ponownie.');
    }
    throw error;
  }
}

