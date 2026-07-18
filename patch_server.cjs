const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetBlock = `    // Verify Subscription Price ID exists
    let priceId = process.env.STRIPE_PRO_PRICE_ID;
    if (!priceId || priceId.trim() === "") {
      priceId = "price_1TbVJUPCXoqZhOLwXn2JIGem";
    }

    const isTerminal = planName === "TERMINAL";
    const terminalProductId =
      process.env.STRIPE_TERMINAL_PRODUCT_ID || "prod_Uk3zSeOffcShqq";

    console.log(
      "Using Resolved price/product for Stripe Checkout. IsTerminal:",
      isTerminal,
    );

    const db = getSupabaseAdmin();`;

const replacementBlock = `    // Resolve price ID dynamically from product IDs in environment
    let isTerminal = planName === "TERMINAL";
    let targetProductId = isTerminal ? process.env.STRIPE_TERMINAL_PRODUCT_ID : process.env.STRIPE_PRO_PRICE_ID;
    let priceId = targetProductId; // By default assume it might be a price ID if it doesn't start with prod_

    if (targetProductId && targetProductId.startsWith("prod_")) {
      const pricesList = await stripe.prices.list({ product: targetProductId, active: true, limit: 1 });
      if (pricesList.data.length > 0) {
        priceId = pricesList.data[0].id;
      } else {
        console.warn("[Stripe] No active price found for product " + targetProductId);
        priceId = ""; // Force fallback
      }
    }

    if (!priceId) {
      priceId = "price_1TbVJUPCXoqZhOLwXn2JIGem"; // ultimate hardcoded fallback
    }

    console.log(
      "Using Resolved price for Stripe Checkout. IsTerminal:",
      isTerminal, "Price ID:", priceId
    );

    const db = getSupabaseAdmin();`;

code = code.replace(targetBlock, replacementBlock);

const targetLineItems = `      let lineItems: any[] = [];

      if (isTerminal) {
        lineItems = [
          {
            price_data: {
              currency: "eur",
              product: terminalProductId,
              recurring: { interval: "month" },
              unit_amount: 2490,
            },
            quantity: 1,
          },
          {
            price_data: {
              currency: "eur",
              product: terminalProductId,
              unit_amount: 990,
            },
            quantity: 1,
          },
        ];
      } else {
        lineItems = [
          {
            price: priceId,
            quantity: 1,
          },
        ];
      }`;

const replacementLineItems = `      let lineItems: any[] = [
        {
          price: priceId,
          quantity: 1,
        },
      ];`;

code = code.replace(targetLineItems, replacementLineItems);
fs.writeFileSync('server.ts', code);
console.log('server.ts patched');
