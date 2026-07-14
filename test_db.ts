import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://example.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'example'

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data, error } = await supabase.from('messages').select('*').limit(1)
  console.log(error || data)
}
run()
