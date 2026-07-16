const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const endpoint = `
app.post('/api/admin/update-store', express.json(), async (req, res) => {
  try {
    const { storeId, updates } = req.body;
    if (!storeId) return res.status(400).json({ error: 'Missing storeId' });
    
    const { error } = await supabase.from('businesses').update(updates).eq('id', storeId);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
`;

if (!content.includes('/api/admin/update-store')) {
  content = content.replace("app.post('/api/admin/impersonate'", endpoint + "\napp.post('/api/admin/impersonate'");
  fs.writeFileSync('server.ts', content);
  console.log("Endpoint added.");
} else {
  console.log("Endpoint exists.");
}
