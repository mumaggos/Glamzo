const { Client } = require('pg');

async function testRLS() {
  const client = new Client({
    connectionString: 'postgresql://postgres:191191Asw%40A1%40@db.fkpywjkatsxkgrmboald.supabase.co:5432/postgres'
  });

  try {
    await client.connect();
    
    const polRes = await client.query(`
      SELECT polname, polcmd, pg_get_expr(polqual, polrelid) as qual
      FROM pg_policy 
      WHERE polrelid = 'reward_coupons'::regclass;
    `);
    console.log("Policies:", polRes.rows);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

testRLS();
