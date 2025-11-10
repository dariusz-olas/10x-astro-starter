import { createClient } from "@supabase/supabase-js";

// Mock Supabase client dla testów
export const testSupabaseUrl = process.env.PUBLIC_SUPABASE_URL || "http://localhost:54321";
export const testSupabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY || "test-key";

export const testSupabase = createClient(testSupabaseUrl, testSupabaseKey);

// Helper do tworzenia testowego użytkownika
export async function createTestUser(email: string, password: string) {
  const { data, error } = await testSupabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

// Helper do czyszczenia danych testowych
export async function cleanupTestData(userId: string) {
  // Usuń wszystkie dane użytkownika
  await testSupabase.from("card_reviews").delete().eq("user_id", userId);
  await testSupabase.from("card_scheduling").delete().eq("user_id", userId);
  await testSupabase.from("review_sessions").delete().eq("user_id", userId);
  await testSupabase.from("flashcards").delete().eq("user_id", userId);
}
