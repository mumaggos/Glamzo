const fs = require('fs');
let content = fs.readFileSync('src/components/SalesAgentsTab.tsx', 'utf8');

const target = `        businessesData.forEach(business => {
          if (business.agent_id && perfData[business.agent_id]) {
            const p = perfData[business.agent_id];
            p.totalStores += 1;
            
            let commission = 2; 
            if (business.selected_plan === 'app_tablet' || business.selected_plan === 'pro_terminal' || business.selected_plan?.includes('terminal') || business.tablet_requested) {
              p.terminalStores += 1;
              commission = 5;
            } else {
              p.proStores += 1;
              commission = 2.5;
            }
            
            p.totalCommission += commission;
          }
        });`;

const replacement = `        businessesData.forEach(business => {
          if (business.agent_id && perfData[business.agent_id]) {
            const p = perfData[business.agent_id];
            p.totalStores += 1;
            
            let commission = 0; 
            if (business.selected_plan === 'app_tablet' || business.selected_plan === 'pro_terminal' || business.selected_plan?.includes('terminal') || business.tablet_requested) {
              p.terminalStores += 1;
              commission = 5;
            } else if (business.selected_plan === 'app' || business.selected_plan === 'pro' || business.selected_plan?.includes('pro') || business.selected_plan === 'monthly' || business.selected_plan === 'yearly') {
              p.proStores += 1;
              commission = 2.5;
            }
            
            p.totalCommission += commission;
          }
        });`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/SalesAgentsTab.tsx', content);
