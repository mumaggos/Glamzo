const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres:191191Asw%40A1%40@db.fkpywjkatsxkgrmboald.supabase.co:5432/postgres'
  });

  try {
    await client.connect();
    await client.query(`ALTER TABLE staff ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;`);
    await client.query(`UPDATE staff SET is_active = true WHERE is_active IS NULL;`);
    console.log("Column is_active added to staff!");
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
