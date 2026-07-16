const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const route = `
app.post('/api/admin/delete-store', express.json(), async (req, res) => {
  try {
    const { storeId } = req.body;
    if (!storeId) return res.status(400).json({ error: 'Missing storeId' });
    const { error } = await getSupabaseAdmin().from('businesses').delete().eq('id', storeId);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
`;

code = code.replace(/app\.post\('\/api\/admin\/impersonate'/g, route + "\napp.post('/api/admin/impersonate'");
fs.writeFileSync('server.ts', code);
