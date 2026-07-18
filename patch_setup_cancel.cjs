const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

const targetEffect = `    } else if (status === 'stripe_cancelled') {
      setErrorMsg('Pagamento cancelado ou não concluído.');
      window.history.replaceState({}, document.title, '/partner/setup');
    } else if (status === 'connect_success') {`;

const replacementEffect = `    } else if (status === 'stripe_cancelled' || searchParams.get('checkout_canceled') === 'true') {
      toast.error('O pagamento não foi concluído ou foi cancelado. Por favor, tente novamente ou escolha outro plano.');
      if (business && business.setup_step === 4) {
         setStep(4);
      }
      navigate('/partner/setup', { replace: true });
    } else if (status === 'connect_success') {`;

code = code.replace(targetEffect, replacementEffect);

const targetFetch = `            cancelUrl: window.location.origin + '/partner/setup?status=stripe_cancelled',`;
const replacementFetch = `            cancelUrl: window.location.origin + '/partner/setup?checkout_canceled=true',`;

code = code.replace(targetFetch, replacementFetch);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
console.log('SetupWizard canceled patched');
