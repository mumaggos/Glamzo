const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

const triggerRegex = /const triggerStripeOnboarding = async \(\) => \{[\s\S]*?catch \(err: any\) \{\n      setErrorMsg\(err\.message\);\n      setLoading\(false\);\n    \}\n  \};/;

const newTrigger = `const triggerStripeOnboarding = async () => {
    if (!business) return;
    setLoading(true);
    try {
      const createResponse = await fetch('/api/stripe/create-custom-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          ownerId: user?.id,
          companyName: legalName,
          taxId: nif,
          iban: iban
        })
      });

      if (!createResponse.ok) {
         const createData = await createResponse.json();
         throw new Error(createData.error || 'Falha ao criar conta Stripe');
      }

      const response = await fetch('/api/stripe/connect/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          businessEmail: business.email,
          businessName: business.name,
          returnUrl: window.location.origin + '/partner/setup?status=connect_success&step=4',
          refreshUrl: window.location.origin + '/partner/setup?status=connect_refresh&step=4'
        })
      });
      const data = await response.json();
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create connect session');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };`;

code = code.replace(triggerRegex, newTrigger);
fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
