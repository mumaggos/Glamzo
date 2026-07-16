const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const route = `
app.post('/api/admin/client-bookings', express.json(), async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    const { data, error } = await getSupabaseAdmin()
      .from('bookings')
      .select('*, businesses(name), services(name)')
      .eq('customer_id', userId)
      .order('booking_date', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
`;

code = code.replace(/app\.post\('\/api\/admin\/update-financials'/g, route + "\napp.post('/api/admin/update-financials'");

fs.writeFileSync('server.ts', code);
