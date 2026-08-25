import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  'https://vuqqdcmrkisoymgstrpp.supabase.co';

const supabaseAnonKey =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1cXFkY21ya2lzb3ltZ3N0cnBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MDMwMzUsImV4cCI6MjEwMzA3OTAzNX0.UymkW9MgnSREXFJIr9Nm5U3MjIT7tCrKh9mH_HYsTPg';

let supabaseClient: SupabaseClient | null = null;

try {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage
    }
  });
} catch (err) {
  console.warn('[Supabase Frontend] Live client init notice:', err);
}

export const supabase = supabaseClient;
