const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// Add State
const stateToAdd = `
  const [walletWithdrawals, setWalletWithdrawals] = useState<any[]>([]);
`;
code = code.replace(/const \[payoutRequests, setPayoutRequests\] = useState<any\[\]>\(\[\]\);/, "const [payoutRequests, setPayoutRequests] = useState<any[]>([]);\n" + stateToAdd.trim());

// Add Fetch
const fetchToAdd = `
      const { data: withdrawalsData } = await supabase
        .from('withdrawal_requests')
        .select('*, customer:profiles(full_name, email)')
        .order('created_at', { ascending: false });
      setWalletWithdrawals(withdrawalsData || []);
`;
code = code.replace(/const localRequests = financeService\.getPayouts\(\)\.filter/, fetchToAdd.trim() + "\n      const localRequests = financeService.getPayouts().filter");

fs.writeFileSync('src/pages/Admin.tsx', code);
