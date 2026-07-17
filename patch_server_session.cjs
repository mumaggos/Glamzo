const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `      cancelUrl,
    } = req.body;`;

const replacement = `      cancelUrl,
      couponCode,
    } = req.body;`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacement);
  fs.writeFileSync('server.ts', content);
  console.log("server.ts req.body patched.");
}

const targetStr2 = `      metadata: {
        bookingId: bookingId,
        type: "booking_payment",
      },`;

const replacement2 = `      metadata: {
        bookingId: bookingId,
        type: "booking_payment",
        couponCode: couponCode || "",
      },`;

if (content.includes(targetStr2)) {
  content = content.replace(targetStr2, replacement2);
  fs.writeFileSync('server.ts', content);
  console.log("server.ts metadata patched.");
}
