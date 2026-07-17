const { Client } = require('pg');

async function getRpcs() {
  const client = new Client({
    connectionString: 'postgresql://postgres:191191Asw%40A1%40@db.fkpywjkatsxkgrmboald.supabase.co:5432/postgres'
  });

  try {
    await client.connect();
    
    const rpcRes = await client.query(`
      SELECT proname, pg_get_functiondef(p.oid) as def
      FROM pg_proc p 
      JOIN pg_namespace n ON p.pronamespace = n.oid 
      WHERE n.nspname = 'public' 
      AND proname IN ('get_staff_performance', 'get_explore_shops_with_analytics');
    `);
    
    rpcRes.rows.forEach(r => {
      console.log('--- RPC:', r.proname);
      console.log(r.def);
    });
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

getRpcs();
