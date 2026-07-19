const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetTrialStr = `const subscriptionData = (hasUsedTrial || finalSkipTrial || isTerminal) ? {} : { trial_period_days: 14 };`;
const replacementTrialStr = `const isTrialing = !(hasUsedTrial || finalSkipTrial || isTerminal);
    const subscriptionData = isTrialing ? { 
      trial_period_days: 14, 
      trial_settings: { end_behavior: { missing_payment_method: 'cancel' } } 
    } : undefined;`;

const targetPayloadStr = `const sessionPayload = {
        customer: customerId,
        mode: "subscription",
        allow_promotion_codes: true,
        line_items: lineItems,
        subscription_data: subscriptionData,
        metadata: {`;
const replacementPayloadStr = `const sessionPayload = {
        customer: customerId,
        mode: "subscription",
        allow_promotion_codes: true,
        payment_method_collection: isTrialing ? "if_required" : "always",
        line_items: lineItems,
        subscription_data: subscriptionData,
        metadata: {`;

const targetFallbackPayloadStr = `session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            allow_promotion_codes: true,
            line_items: [
              {
                price: fallbackPriceId,
                quantity: 1,
              },
            ],
            subscription_data: subscriptionData,
            metadata: {`;
const replacementFallbackPayloadStr = `session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            allow_promotion_codes: true,
            payment_method_collection: isTrialing ? "if_required" : "always",
            line_items: [
              {
                price: fallbackPriceId,
                quantity: 1,
              },
            ],
            subscription_data: subscriptionData,
            metadata: {`;

code = code.replace(targetTrialStr, replacementTrialStr);
code = code.replace(targetPayloadStr, replacementPayloadStr);
code = code.replace(targetFallbackPayloadStr, replacementFallbackPayloadStr);

fs.writeFileSync('server.ts', code);
console.log('server.ts payment collection patched');
