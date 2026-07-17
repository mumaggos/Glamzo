const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `    const {
      bookingId,
      amount, // We keep this for fallback but use DB value securely
      stripeAccountId,
      customerEmail,
      serviceName,
      businessName,
      successUrl,
      cancelUrl,
    } = req.body;`;

const replacement = `    const {
      bookingId,
      amount, // We keep this for fallback but use DB value securely
      stripeAccountId,
      customerEmail,
      serviceName,
      businessName,
      successUrl,
      cancelUrl,
    } = req.body;

    console.log("ID Recebido no Backend:", bookingId);`;

if (content.includes(targetStr)) {
  fs.writeFileSync('server.ts', content.replace(targetStr, replacement));
  console.log("server.ts patched with console.log.");
} else {
  console.log("Could not find target string in server.ts");
}
