const fs = require('fs');
let text = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');

const importSpot = text.indexOf('import { Business');
text = text.slice(0, importSpot) + 'import { supabase } from "../lib/supabase";\n' + text.slice(importSpot);

const hookSpot = text.indexOf('const [timeFilter, setTimeFilter] = useState');
const newStates = `
  const [rpcStats, setRpcStats] = useState<any>(null);
  const [loadingRpc, setLoadingRpc] = useState(false);
`;
text = text.slice(0, hookSpot) + newStates + text.slice(hookSpot);

const todayStr = "const today = new Date();";
const effectLogic = `
  useEffect(() => {
    if (!business?.id) return;
    
    const fetchStats = async () => {
      setLoadingRpc(true);
      try {
        const now = new Date();
        let startDate = new Date();
        startDate.setHours(0,0,0,0);
        let endDate = new Date(now);
        
        if (timeFilter === 'week') {
           startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (timeFilter === 'month') {
           startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        }
        
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];
        
        const { data, error } = await supabase.rpc('get_dashboard_stats', {
          p_business_id: business.id,
          p_start_date: startStr,
          p_end_date: endStr
        });
        
        if (!error && data) {
          setRpcStats(data);
        } else {
          setRpcStats(null); // fallback to client side
        }
      } catch (err) {
        setRpcStats(null);
      } finally {
        setLoadingRpc(false);
      }
    };
    
    fetchStats();
  }, [business?.id, timeFilter]);
`;
text = text.replace(todayStr, effectLogic + '\n  ' + todayStr);

// Replace filteredRevenue calculation to use rpcStats if available
const revenueRegex = /const filteredRevenue = filteredBookingsList\.reduce\(\(sum, b\) => sum \+ \(b\.total_price \|\| 0\), 0\);/;
const revenueLogic = `
  const filteredRevenue = rpcStats ? rpcStats.revenue : filteredBookingsList.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const displayBookingsCount = rpcStats ? rpcStats.total_bookings : filteredBookingsList.length;
`;
text = text.replace(revenueRegex, revenueLogic);

// Ensure the count UI uses displayBookingsCount instead of filteredBookingsList.length
text = text.replace(/\{filteredBookingsList\.length\}/g, '{displayBookingsCount}');

fs.writeFileSync('src/components/DashboardOverview.tsx', text);
