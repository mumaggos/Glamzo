import { createClient } from '@supabase/supabase-js';
import { useTranslation } from "react-i18next";

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://fkpywjkatsxkgrmboald.supabase.co/';
let envAnon = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
if (envAnon && envAnon.length < 50) envAnon = undefined;
const supabaseAnonKey = envAnon || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcHl3amthdHN4a2dybWJvYWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjY1NzEsImV4cCI6MjA5NDgwMjU3MX0.6tkKlKXwoCPxeCI0yi-uRwYkN-nt41kAcJtr4uBuoMA';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);