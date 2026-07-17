const { Client } = require('pg');

async function introspect() {
  const client = new Client({
    connectionString: 'postgresql://postgres:191191Asw%40A1%40@db.fkpywjkatsxkgrmboald.supabase.co:5432/postgres'
  });

  try {
    await client.connect();
    
    // Get all tables in public schema
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);
    
    const tables = tablesRes.rows.map(r => r.table_name);
    
    const schema = {};
    
    for (const table of tables) {
      const colsRes = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1;
      `, [table]);
      schema[table] = colsRes.rows.map(r => ({ name: r.column_name, type: r.data_type }));
    }
    
    const rpcRes = await client.query(`
      SELECT proname, prosrc 
      FROM pg_proc p 
      JOIN pg_namespace n ON p.pronamespace = n.oid 
      WHERE n.nspname = 'public';
    `);
    const rpcs = rpcRes.rows.map(r => r.proname);
    
    console.log(JSON.stringify({ tables: schema, rpcs: rpcs }, null, 2));
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

introspect();
