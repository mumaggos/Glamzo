const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const endpoints = `

app.post('/api/staff/bookings/query', express.json(), async (req, res) => {
  try {
    const { businessId, staffId, limitDate } = req.body;
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("bookings")
      .select("*, customer_profile:profiles(full_name, avatar_url), service:services(name, duration_minutes, price)")
      .eq("business_id", businessId)
      .or(\`staff_id.eq.\${staffId},staff_id.is.null\`)
      .gte("booking_date", limitDate)
      .neq("booking_status", "cancelled")
      .order("start_time", { ascending: true });
      
    if (error) throw error;
    res.json({ data });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/staff/bookings/create', express.json(), async (req, res) => {
  try {
    const { payload } = req.body;
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("bookings").insert(payload);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/staff/bookings/update', express.json(), async (req, res) => {
  try {
    const { id, payload } = req.body;
    const db = getSupabaseAdmin();
    const { error } = await db.from("bookings").update(payload).eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

`;

content = content.replace('async function startServer() {', endpoints + '\nasync function startServer() {');

fs.writeFileSync('server.ts', content);
