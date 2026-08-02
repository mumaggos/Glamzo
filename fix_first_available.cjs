const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The broken route is right above async function startServer()
// Actually, startServer() is on line 3013.
// Let's replace the broken start of first-available.

const fixStr = `
app.get("/api/v1/business/:slug/first-available", async (req, res) => {
  try {
    const { slug } = req.params;
    const { data: business } = await getSupabaseAdmin()
      .from("businesses")
      .select("id")
      .eq("slug", slug)
      .single();
    if (!business) return res.status(404).json({ error: "Not found" });
    const businessId = business.id;
    
    const [{ data: hoursData }, { data: staffData }, { data: bookingsData }] = await Promise.all([
      getSupabaseAdmin().from("business_hours").select("*").eq("business_id", businessId),
      getSupabaseAdmin().from("staff").select("*").eq("business_id", businessId).eq("is_active", true),
      getSupabaseAdmin().from("bookings").select("*").eq("business_id", businessId).in("status", ["confirmed", "pending"])
    ]);
    
    if (!hoursData || !staffData) {
       return res.json({ available: false, label: "Sem vagas nos próx. 14 dias" });
    }
    
    const today = new Date();
    const options = { timeZone: "Europe/Lisbon" };
`;

// In the current file, line 3013 is `async function startServer() {`
// Then it has:
//       }
//       const slotDurationMins = 30;

// This means the `app.get` was cut and `startServer` is in the wrong place?
// No! startServer is where it is, but `first-available` got pushed into startServer?
// Wait, if first-available was cut, we should just find:
// async function startServer() {
//       }
//       const slotDurationMins = 30;

// And replace `      }\n\n      const slotDurationMins = 30;` with the fixStr + `\n      const slotDurationMins = 30;` ?
// Wait, if we replace it there, first-available will be INSIDE startServer(). Is that bad?
// No, it's fine.
// But wait, the route needs to end. It ends with:
//     } catch (err: any) {
//       res.status(500).json({ error: err.message });
//     }
//   });
// Which IS present!

code = code.replace(/async function startServer\(\) \{\n\n\n      \}\n\n      const slotDurationMins = 30;/g, fixStr + '      const slotDurationMins = 30;');

// But wait, where is startServer()? We need startServer()!
// So let's add async function startServer() { BEFORE the fixStr.
code = code.replace(fixStr + '      const slotDurationMins = 30;', 'async function startServer() {\n' + fixStr + '      const slotDurationMins = 30;');

fs.writeFileSync('server.ts', code);
