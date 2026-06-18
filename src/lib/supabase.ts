import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

// Check if actual env vars are configured and not just placeholder strings
export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== '' &&
  supabaseUrl.includes('supabase.co') &&
  supabaseAnonKey.length > 20
) || (typeof window !== 'undefined' && localStorage.getItem('glamzo_bypass_supabase') === 'true');

// We export the authenticated Supabase client.
// If not configured, we instantiate with placeholders to prevent startup crashes.
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key'
);
