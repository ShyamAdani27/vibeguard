import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://vuqqdcmrkisoymgstrpp.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1cXFkY21ya2lzb3ltZ3N0cnBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MDMwMzUsImV4cCI6MjEwMzA3OTAzNX0.UymkW9MgnSREXFJIr9Nm5U3MjIT7tCrKh9mH_HYsTPg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySupabaseConnection() {
  console.log('[Supabase Setup] Testing connection to:', supabaseUrl);
  
  // Test basic query
  try {
    const { data, error } = await supabase.from('projects').select('*').limit(5);
    if (error) {
      console.log('[Supabase Setup] "projects" table status:', error.message);
    } else {
      console.log('[Supabase Setup] "projects" table is ready! Rows found:', data?.length);
    }
  } catch (err: any) {
    console.error('[Supabase Setup] Error testing table:', err.message);
  }
}

verifySupabaseConnection();
