import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  
  // Gemini API Keys Pool
  geminiKeys: [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
  ].filter(Boolean) as string[],

  // Other Authorized Providers
  providerBKey: process.env.PROVIDER_B_API_KEY || '',
  providerCKey: process.env.PROVIDER_C_API_KEY || '',
  providerDKey: process.env.PROVIDER_D_API_KEY || '',
  
  // Settings
  cooldownDurationSeconds: parseInt(process.env.AI_COOLDOWN_SECONDS || '60', 10),
};
