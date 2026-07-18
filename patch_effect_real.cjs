const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

const targetEffect = `  useEffect(() => {
    const status = searchParams.get('status');
    const stepParam = searchParams.get('step');
    const checkoutSuccess = searchParams.get('checkout_success');
    const sessionId = searchParams.get('session_id');

    // Wait until business is loaded before processing
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
fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
console.log('SetupWizard effect really patched');
