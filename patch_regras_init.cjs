const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/SettingsTab.tsx', 'utf8');

code = code.replace(
  /const \[rules, setRules\] = useState\(\{[\s\S]*?cancellation_policy: "flexible"\n  \}\);/g,
  `const [rules, setRules] = useState({
    min_notice: business?.min_booking_notice?.toString() || "60",
    cancellation_policy: business?.cancellation_policy || "flexible"
  });`
);

fs.writeFileSync('src/pages/partner/tabs/SettingsTab.tsx', code);
