const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = `    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {`;
const replacement1 = `    // --- EVENT TYPE: customer.subscription.created / updated / deleted / trial_will_end ---
    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted" ||
      event.type === "customer.subscription.trial_will_end"
    ) {`;

code = code.replace(target1, replacement1);

const target2 = `    // --- EVENT TYPE: invoice.paid / invoice.payment_failed ---`;
const replacement2 = `    // --- EVENT TYPE: payment_intent.payment_failed ---
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      console.log(\`[Stripe Webhook payment_intent.payment_failed] Payment failed for intent \${paymentIntent.id}\`);
      // Optional: Notify the user or update specific logs
    }

    // --- EVENT TYPE: invoice.paid / invoice.payment_failed ---`;

code = code.replace(target2, replacement2);

fs.writeFileSync('server.ts', code);
console.log("server.ts webhook patched");
