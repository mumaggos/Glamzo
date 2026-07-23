const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `app.get("/api/stripe/account-status", async (req, res) => {`;

const newEndpoint = `app.post("/api/stripe/create-custom-account", express.json(), async (req, res) => {
  try {
    const { businessId, ownerId } = req.body;
    if (!businessId || !ownerId) {
      return res.status(400).json({ error: "businessId and ownerId are required" });
    }

    const { data: business, error: dbErr } = await db
      .from("businesses")
      .select("stripe_account_id, email, name")
      .eq("id", businessId)
      .single();

    if (dbErr || !business) {
      return res.status(404).json({ error: "Business not found" });
    }

    let stripeAccountId = business.stripe_account_id;
    const stripe = getStripe();

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'custom',
        country: 'PT',
        email: business.email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      stripeAccountId = account.id;

      const { error: updateErr } = await db
        .from("businesses")
        .update({ stripe_account_id: stripeAccountId })
        .eq("id", businessId);

      if (updateErr) {
        console.error("Erro ao atualizar stripe_account_id:", updateErr);
      }
    }

    const accountSession = await stripe.accountSessions.create({
      account: stripeAccountId,
      components: {
        account_onboarding: { enabled: true },
      },
    });

    res.json({ client_secret: accountSession.client_secret });
  } catch (error: any) {
    console.error("Erro em /api/stripe/create-custom-account:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/stripe/account-status", async (req, res) => {`;

content = content.replace(targetStr, newEndpoint);

fs.writeFileSync('server.ts', content);
