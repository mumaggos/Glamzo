const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

const targetEffect = `  useEffect(() => {
    const status = searchParams.get('status');
    const stepParam = searchParams.get('step');

    if (status === 'stripe_cancelled') {`;

const replacementEffect = `  useEffect(() => {
    const status = searchParams.get('status');
    const stepParam = searchParams.get('step');
    const checkoutSuccess = searchParams.get('checkout_success');
    const sessionId = searchParams.get('session_id');

    if (checkoutSuccess === 'true') {
      setSuccessMsg('Confirmado! O seu plano foi subscrito com sucesso.');
      setStep(5);
      if (business && business.setup_step !== 5) {
         supabase.from('businesses').update({ setup_step: 5 }).eq('id', business.id).then();
         business.setup_step = 5;
      }
      if (sessionId && business) {
         // Optionally verify subscription in background
         fetch("/api/stripe/verify-subscription", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ businessId: business.id, sessionId }),
         }).catch(() => {});
      }
      window.history.replaceState({}, document.title, '/partner/setup');
    } else if (status === 'stripe_cancelled') {`;

code = code.replace(targetEffect, replacementEffect);

const targetFetch = `            successUrl: window.location.origin + '/setup/payment-success?session_id={CHECKOUT_SESSION_ID}',`;
const replacementFetch = `            successUrl: window.location.origin + '/partner/setup?checkout_success=true&session_id={CHECKOUT_SESSION_ID}',`;

code = code.replace(targetFetch, replacementFetch);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
console.log('SetupWizard.tsx patched!');
