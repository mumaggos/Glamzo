const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetPortal = `      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      res.json({ url: session.url });`;

const replacementPortal = `      try {
        const session = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: returnUrl,
        });
        res.json({ url: session.url });
      } catch (err) {
        if (err.statusCode === 404 || err.code === "resource_missing") {
           console.warn(\`[Ghost Customer Portal] Customer \${customerId} not found. Clearing from DB.\`);
           await db.from("businesses").update({ 
             subscription_active: false, 
             subscription_status: 'canceled', 
             stripe_customer_id: null 
           }).eq("id", businessId);
           res.status(404).json({ error: "O seu cliente Stripe foi eliminado. Por favor, reconfigure a subscrição." });
           return;
        }
        throw err;
      }`;
code = code.replace(targetPortal, replacementPortal);

// Let's also patch the connect/onboard just in case
const targetOnboard2 = `      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: "account_onboarding",
      });`;

const replacementOnboard2 = `      let accountLink;
      try {
        accountLink = await stripe.accountLinks.create({
          account: stripeAccountId,
          refresh_url: refreshUrl,
          return_url: returnUrl,
          type: "account_onboarding",
        });
      } catch (err) {
        if (err.statusCode === 404 || err.code === "resource_missing") {
           console.warn(\`[Ghost Account Link] Account \${stripeAccountId} not found. Clearing from DB.\`);
           await db.from("businesses").update({ stripe_account_id: null, charges_enabled: false, payouts_enabled: false }).eq("id", businessId);
           res.status(404).json({ error: "A sua conta Stripe (Connect) foi eliminada ou não existe. Atualize a página para criar uma nova." });
           return;
        }
        throw err;
      }`;
code = code.replace(targetOnboard2, replacementOnboard2);

fs.writeFileSync('server.ts', code);
console.log("Portal and Onboard Resilience patched!");
