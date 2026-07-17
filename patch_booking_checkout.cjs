const fs = require('fs');
let content = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

const targetStr = `              bookingId: data.id,
              amount: finalPriceToPay, // We keep this for fallback but use DB value securely
              stripeAccountId: business.stripe_account_id,
              customerEmail: user.email,
              serviceName: selectedServices[0].name,
              businessName: business.name,
              successUrl: \`\${window.location.origin}/account?status=success\`,
              cancelUrl: \`\${window.location.origin}/account?status=cancelled\`,
            })
          });`;

const replacement = `              bookingId: data.id,
              amount: finalPriceToPay, // We keep this for fallback but use DB value securely
              stripeAccountId: business.stripe_account_id,
              customerEmail: user.email,
              serviceName: selectedServices[0].name,
              businessName: business.name,
              successUrl: \`\${window.location.origin}/account?status=success\`,
              cancelUrl: \`\${window.location.origin}/account?status=cancelled\`,
              couponCode: appliedPromo?.type === 'reward' ? appliedPromo.code : null,
            })
          });`;

if (content.includes(targetStr)) {
  fs.writeFileSync('src/components/BookingModal.tsx', content.replace(targetStr, replacement));
  console.log("BookingModal.tsx fetch patched.");
} else {
  console.log("Could not find target string in BookingModal.tsx for fetch.");
}
