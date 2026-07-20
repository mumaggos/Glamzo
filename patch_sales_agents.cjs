const fs = require('fs');
let content = fs.readFileSync('src/components/SalesAgentsTab.tsx', 'utf8');

content = content.replace(
  /\.select\('agent_id, selected_plan'\);/,
  `.select('agent_id, selected_plan, tablet_requested');`
);

content = content.replace(
  /if \(business\.selected_plan === 'pro' \|\| business\.selected_plan === 'app_tablet'\) \{[\s\S]*?\} else if \(business\.selected_plan === 'pro_terminal' \|\| business\.selected_plan\?\.includes\('terminal'\)\) \{[\s\S]*?\}/,
  `if (business.selected_plan === 'app_tablet' || business.selected_plan === 'pro_terminal' || business.selected_plan?.includes('terminal') || business.tablet_requested) {
              p.terminalStores += 1;
              commission = 5;
            } else {
              p.proStores += 1;
              commission = 2.5;
            }`
);

fs.writeFileSync('src/components/SalesAgentsTab.tsx', content);
