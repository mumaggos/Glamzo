const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres:191191Asw%40A1%40@db.fkpywjkatsxkgrmboald.supabase.co:5432/postgres'
  });

  try {
    await client.connect();
    await client.query(`ALTER TABLE reward_coupons ADD COLUMN IF NOT EXISTS used_at timestamp with time zone;`);
    console.log("Column used_at added!");
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
