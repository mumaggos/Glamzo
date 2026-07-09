const fs = require('fs');
let text = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');

text = text.replace(/.*const \[rpcStats, setRpcStats\].*\n/g, '');
text = text.replace(/.*const \[loadingRpc, setLoadingRpc\].*\n/g, '');

fs.writeFileSync('src/components/DashboardOverview.tsx', text);
