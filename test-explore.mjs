import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fkpywjkatsxkgrmboald.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '...'; // I will just use fetch to test
// Actually I'll just use the supabase client if I have the anon key.
