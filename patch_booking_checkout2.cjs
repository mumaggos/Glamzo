const fs = require('fs');
let content = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

const targetStr = `              cancelUrl: \`\${window.location.origin}/account?status=cancelled\`,
            })
          });`;

const replacement = `              cancelUrl: \`\${window.location.origin}/account?status=cancelled\`,
              couponCode: (appliedPromo && appliedPromo.type === 'reward') ? appliedPromo.code : null,
            })
          });`;

if (content.includes(targetStr)) {
  fs.writeFileSync('src/components/BookingModal.tsx', content.replace(targetStr, replacement));
  console.log("BookingModal.tsx fetch patched.");
} else {
  console.log("Could not find target string in BookingModal.tsx for fetch.");
}
