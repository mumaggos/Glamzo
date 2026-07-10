import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
dotenv.config();

async function getCols() {
  const url = process.env.VITE_SUPABASE_URL + '/rest/v1/reviews?limit=1';
  const res = await fetch(url, {
    headers: {
      'apikey': process.env.VITE_SUPABASE_ANON_KEY!
    }
  });
  const data = await res.json();
  console.log(data);
}
getCols();
