const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const endpoint = `
app.post('/api/user/affiliate-referrals', express.json(), async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    
    const { data, error } = await getSupabaseAdmin()
      .from('affiliate_referrals')
      .select('*, business:businesses(name)')
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
`;

content = content.replace(
  /app\.post\('\/api\/admin\/impersonate'/,
  endpoint + "\napp.post('/api/admin/impersonate'"
);

fs.writeFileSync('server.ts', content);
