const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Handling customer.subscription.deleted & customer.deleted
const target1 = `    // --- EVENT TYPE: customer.subscription.updated / customer.subscription.deleted ---
    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {`;

const replacement1 = `    // --- EVENT TYPE: customer.deleted ---
    if (event.type === "customer.deleted") {
      const customer = event.data.object;
      const customerId = customer.id;
      
      console.log(\`[Stripe Webhook customer.deleted] Removing customer \${customerId}\`);
      await db.from("businesses").update({ 
        subscription_active: false, 
        subscription_status: 'canceled', 
        stripe_customer_id: null 
      }).eq("stripe_customer_id", customerId);
    }

    // --- EVENT TYPE: customer.subscription.updated / customer.subscription.deleted ---
    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {`;
code = code.replace(target1, replacement1);

// 2. Fix the status for deleted to be 'canceled' instead of 'expired'
const target2 = `      if (event.type === "customer.subscription.deleted") {
        syncedStatus = "expired";
      }`;
const replacement2 = `      if (event.type === "customer.subscription.deleted") {
        syncedStatus = "canceled";
      }`;
code = code.replace(target2, replacement2);

// 3. account.updated / account.application.deauthorized
const target3 = `    // --- EVENT TYPE: account.updated (Connected Accounts operational status changes!) ---
    if (event.type === "account.updated") {
      const activeAccount = event.data.object as Stripe.Account;
      const stripeAccountId = activeAccount.id;

      const verifiedCharges = activeAccount.charges_enabled ? true : false;
      const verifiedPayouts = activeAccount.payouts_enabled ? true : false;

      const { error: bizUpdateErr } = await db
        .from("businesses")
        .update({
          charges_enabled: verifiedCharges,
          payouts_enabled: verifiedPayouts,
        })
        .eq("stripe_account_id", stripeAccountId);

      if (bizUpdateErr) {
        console.error(
          "[Webhook Connect Operations Sync Err]:",
          bizUpdateErr.message,
        );
      } else {
        console.log(
          \`[Webhook Connect Sync Completed] Operational capabilities for account \${stripeAccountId}: charges_enabled=\${verifiedCharges}, payouts_enabled=\${verifiedPayouts}\`,
        );
      }
    }`;

const replacement3 = `    // --- EVENT TYPE: account.application.deauthorized ---
    if (event.type === "account.application.deauthorized") {
      const deauthAccount = event.account; // Depending on event structure, it could be event.account
      if (deauthAccount) {
         console.log(\`[Stripe Webhook account.application.deauthorized] Deauthorizing \${deauthAccount}\`);
         await db.from("businesses").update({ 
           stripe_account_id: null,
           charges_enabled: false,
           payouts_enabled: false 
         }).eq("stripe_account_id", deauthAccount);
      }
    }

    // --- EVENT TYPE: account.updated (Connected Accounts operational status changes!) ---
    if (event.type === "account.updated") {
      const activeAccount = event.data.object as Stripe.Account;
      const stripeAccountId = activeAccount.id;

      const transfersDisabled = activeAccount.capabilities?.transfers === "inactive" || activeAccount.capabilities?.transfers === "disabled";
      
      let updateData: any = {
          charges_enabled: activeAccount.charges_enabled ? true : false,
          payouts_enabled: activeAccount.payouts_enabled ? true : false,
      };
      
      if (transfersDisabled) {
         updateData.stripe_account_id = null;
         updateData.charges_enabled = false;
         updateData.payouts_enabled = false;
         console.log(\`[Stripe Webhook account.updated] Transfers inactive for \${stripeAccountId}. Detaching account.\`);
      }

      const { error: bizUpdateErr } = await db
        .from("businesses")
        .update(updateData)
        .eq("stripe_account_id", stripeAccountId);

      if (bizUpdateErr) {
        console.error(
          "[Webhook Connect Operations Sync Err]:",
          bizUpdateErr.message,
        );
      } else {
        console.log(
          \`[Webhook Connect Sync Completed] Operational capabilities for account \${stripeAccountId}: charges_enabled=\${updateData.charges_enabled}, payouts_enabled=\${updateData.payouts_enabled}\`,
        );
      }
    }`;
code = code.replace(target3, replacement3);

fs.writeFileSync('server.ts', code);
console.log("Webhooks patched!");
