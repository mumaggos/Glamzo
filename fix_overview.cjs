const fs = require('fs');
let text = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');

// Remove rpcStats and fetchStats
text = text.replace(
`      const [rpcStats, setRpcStats] = useState<any>(null);
  const [loadingRpc, setLoadingRpc] = useState(false);`,
  ''
);

text = text.replace(/  useEffect\(\(\) => \{\n    if \(!business\?\.id\) return;\n    \n    const fetchStats = async \(\) => \{[\s\S]*?fetchStats\(\);\n  \}, \[business\?\.id, timeFilter\]\);\n/, '');

text = text.replace(
`  const filteredRevenue = rpcStats ? rpcStats.revenue : filteredBookingsList.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const displayBookingsCount = rpcStats ? rpcStats.total_bookings : filteredBookingsList.length;`,
`  const filteredRevenue = filteredBookingsList.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
  const displayBookingsCount = filteredBookingsList.length;`
);

// Fix Reviews card onClick
text = text.replace(
`        <div onClick={() => setActiveTab('financas')} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden cursor-pointer hover:border-emerald-300 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600" />`,
`        <div onClick={() => setShowReviewsModal(true)} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden cursor-pointer hover:border-purple-300 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600" />`
);

fs.writeFileSync('src/components/DashboardOverview.tsx', text);
