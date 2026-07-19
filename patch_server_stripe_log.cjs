const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `      console.log(
        "Attempting Stripe session creation for", planName || "PRO", "plan"
      );
      session = await stripe.checkout.sessions.create({`;
const replacementStr = `      const sessionPayload = {
        customer: customerId,
        mode: "subscription",
        allow_promotion_codes: true,
        line_items: lineItems,
        subscription_data: subscriptionData,
        metadata: {
          business_id: businessId,
          businessId: businessId,
          owner_id: business.owner_id,
          type: "pro_subscription",
          plan_name: planName || "PRO",
        },
        success_url: calculatedSuccessUrl,
        cancel_url: calculatedCancelUrl,
      };
      console.log("Attempting Stripe session creation for", planName || "PRO", "plan");
      console.log("Stripe payload:", JSON.stringify(sessionPayload, null, 2));
      session = await stripe.checkout.sessions.create(sessionPayload);`;

code = code.replace(`      console.log(
        \`Attempting Stripe session creation for \${planName || "PRO"} plan\`,
      );
      session = await stripe.checkout.sessions.create({`, replacementStr);

fs.writeFileSync('server.ts', code);
console.log('server.ts stripe log patched');
