const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

const targetEffect = `  useEffect(() => {
    const status = searchParams.get('status');
    const stepParam = searchParams.get('step');
    const checkoutSuccess = searchParams.get('checkout_success');
    const sessionId = searchParams.get('session_id');

    if (checkoutSuccess === 'true' && business) {`;

const replacementEffect = `  useEffect(() => {
    if (!business) return;
    const status = searchParams.get('status');
    const stepParam = searchParams.get('step');
    const checkoutSuccess = searchParams.get('checkout_success');
    const sessionId = searchParams.get('session_id');

    if (!status && !stepParam && !checkoutSuccess && !searchParams.get('checkout_canceled')) return;

    if (checkoutSuccess === 'true') {`;

code = code.replace(targetEffect, replacementEffect);

// Wait, I also removed `&& business` from `if (checkoutSuccess === 'true' && business) {` because business is now guaranteed.
fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
console.log('SetupWizard effect patched');
