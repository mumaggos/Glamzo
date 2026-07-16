const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const routeCode = `

app.post('/api/admin/impersonate', express.json(), async (req, res) => {
  try {
    const { adminId, targetEmail } = req.body;
    const db = getSupabaseAdmin();
    // Verify admin
    const { data: adminUser } = await db.from('profiles').select('role').eq('id', adminId).single();
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Generate magic link
    const { data: linkData, error: linkErr } = await db.auth.admin.generateLink({
      type: 'magiclink',
      email: targetEmail
    });
    
    if (linkErr) throw linkErr;
    
    res.json({ link: linkData.properties.action_link });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

`;

content = content.replace("async function startServer() {", routeCode + "\nasync function startServer() {");
fs.writeFileSync('server.ts', content);
