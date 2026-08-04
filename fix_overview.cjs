const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/OverviewTab.tsx', 'utf8');

code = code.replace(
  'resolvedSubscriptionStatus="active"\n         trialDaysRemaining={14}',
  `resolvedSubscriptionStatus={business?.subscription_status === 'trialing' ? 'trialing' : business?.subscription_status === 'active' ? 'active' : 'expired'}\n         trialDaysRemaining={business?.trial_ends_at ? Math.max(0, Math.ceil((new Date(business.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 3600 * 24))) : 0}`
);

fs.writeFileSync('src/pages/partner/tabs/OverviewTab.tsx', code);
