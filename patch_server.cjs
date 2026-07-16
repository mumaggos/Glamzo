const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const updateStoreLogic = `
app.post('/api/admin/update-store', express.json(), async (req, res) => {
  try {
    const { storeId, updates } = req.body;
    if (!storeId) return res.status(400).json({ error: 'Missing storeId' });
    
    const { error } = await getSupabaseAdmin().from('businesses').update(updates).eq('id', storeId);
    
    if (error) {
      console.error("Supabase Error Update Store:", error);
      throw new Error(error.message || JSON.stringify(error));
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
`;

code = code.replace(/app\.post\('\/api\/admin\/update-store'[\s\S]*?\}\);\n/, updateStoreLogic.trim() + '\n\n');
fs.writeFileSync('server.ts', code);
