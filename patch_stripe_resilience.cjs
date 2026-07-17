const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Account Status Resilience
const targetStatus = `    const stripe = getStripe();
    const account = await stripe.accounts.retrieve(business.stripe_account_id);`;

const replacementStatus = `    const stripe = getStripe();
    let account;
    try {
      account = await stripe.accounts.retrieve(business.stripe_account_id);
    } catch (err) {
      if (err.statusCode === 404 || err.code === "resource_missing") {
         console.warn(\`[Ghost Account] Connect account \${business.stripe_account_id} not found. Clearing from DB.\`);
         await db.from("businesses").update({ 
           stripe_account_id: null, 
           charges_enabled: false, 
           payouts_enabled: false 
         }).eq("id", businessId);
         res.json({ connected: false });
         return;
      }
      throw err;
    }`;
code = code.replace(targetStatus, replacementStatus);


// 2. Subscription Verification Resilience
const targetVerify = `    // Retrieve active subscription details directly from Stripe
    console.log(
      \`[Verify Subscription] Retrieving finalized Stripe subscription details for ID: \${subId}\`,
    );
    const stripeSub = await stripe.subscriptions.retrieve(subId);`;

const replacementVerify = `    // Retrieve active subscription details directly from Stripe
    console.log(
      \`[Verify Subscription] Retrieving finalized Stripe subscription details for ID: \${subId}\`,
    );
    let stripeSub;
    try {
       stripeSub = await stripe.subscriptions.retrieve(subId);
    } catch (err) {
       if (err.statusCode === 404 || err.code === "resource_missing") {
          console.warn(\`[Ghost Subscription] Subscription \${subId} not found in Stripe. Clearing from DB.\`);
          await db.from("businesses").update({
             subscription_active: false,
             subscription_status: 'canceled',
             stripe_subscription_id: null
          }).eq("id", resolvedBusinessId);
          res.status(404).json({ error: "Nenhuma subscrição ativa encontrada no Stripe (Conta Removida)." });
          return;
       }
       throw err;
    }`;
code = code.replace(targetVerify, replacementVerify);

// 3. Connect Onboard Resilience (If they try to create link for deleted account)
const targetOnboard = `    let stripeAccountId = business.stripe_account_id;

    if (!stripeAccountId) {`;

const replacementOnboard = `    let stripeAccountId = business.stripe_account_id;

    if (stripeAccountId) {
      try {
        await stripe.accounts.retrieve(stripeAccountId);
      } catch (err) {
        if (err.statusCode === 404 || err.code === "resource_missing") {
           console.warn(\`[Ghost Account Onboard] Connect account \${stripeAccountId} not found. Re-creating.\`);
           stripeAccountId = null;
        }
      }
    }

    if (!stripeAccountId) {`;
code = code.replace(targetOnboard, replacementOnboard);

fs.writeFileSync('server.ts', code);
console.log("Resilience patched!");
