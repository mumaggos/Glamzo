const fs = require('fs');
let code = fs.readFileSync('src/pages/Account.tsx', 'utf8');

// Insert the useEffect for realtime and initial fetch
const realtimeEffect = `
  const [walletBalance, setWalletBalance] = useState(0);
  const [glamzoPoints, setGlamzoPoints] = useState(0);

  // Realtime subscription & initial fetch for wallet and points
  useEffect(() => {
    if (!user) return;

    const fetchBalances = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('glamzo_points, wallet_balance, affiliate_balance')
          .eq('id', user.id)
          .maybeSingle();
        
        if (data) {
          setGlamzoPoints(data.glamzo_points || 0);
          setWalletBalance(data.wallet_balance || data.affiliate_balance || 0);
        }
      } catch (err) {
        console.error('Error fetching balances:', err);
      }
    };

    fetchBalances();

    const channel = supabase.channel(\`account_balances_\${user.id}\`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: \`id=eq.\${user.id}\` },
        (payload) => {
          if (payload.new) {
            setGlamzoPoints(payload.new.glamzo_points || 0);
            setWalletBalance(payload.new.wallet_balance || payload.new.affiliate_balance || 0);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
`;

// Find where to insert it, maybe after `const { user, profile, updateProfile, refreshProfile, loading: authLoading } = useAuth();`
code = code.replace(
  /const { user, profile, updateProfile, refreshProfile, loading: authLoading } = useAuth\(\);/,
  `const { user, profile, updateProfile, refreshProfile, loading: authLoading } = useAuth();\n` + realtimeEffect
);

// Update variables
code = code.replace(
  /const currentPointsBalance = profile\?\.glamzo_points \|\| 0;/,
  `const currentPointsBalance = glamzoPoints;`
);

code = code.replace(
  /const currentAffiliateBalance = profile\?\.affiliate_balance \|\| 0;/,
  `const currentAffiliateBalance = walletBalance;`
);

fs.writeFileSync('src/pages/Account.tsx', code);
