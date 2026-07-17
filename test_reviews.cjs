const { Client } = require('pg');

async function testRLS() {
  const client = new Client({
    connectionString: 'postgresql://postgres:191191Asw%40A1%40@db.fkpywjkatsxkgrmboald.supabase.co:5432/postgres'
  });

  try {
    await client.connect();
    
    // Check if RLS is enabled on reviews
    const res = await client.query(`
      SELECT relrowsecurity 
      FROM pg_class 
      WHERE relname = 'reviews';
    `);
    console.log("RLS Enabled:", res.rows[0]?.relrowsecurity);
    
    // Check policies on reviews
    const polRes = await client.query(`
      SELECT polname, polcmd 
      FROM pg_policy 
      WHERE polrelid = 'reviews'::regclass;
    `);
    console.log("Policies:", polRes.rows);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

testRLS();
