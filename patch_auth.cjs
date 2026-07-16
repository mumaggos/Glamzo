const fs = require('fs');
let code = fs.readFileSync('src/hooks/useAuth.tsx', 'utf8');

const newEffect = `
  // Realtime Profile Updates
  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;
    
    const channel = supabase.channel(\`public:profiles:\${user.id}\`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: \`id=eq.\${user.id}\` },
        (payload) => {
          if (payload.new) {
            setProfile((prev) => prev ? { ...prev, ...payload.new } : payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
`;

code = code.replace(
  /  \/\/ Real SQL Auth signup/,
  newEffect + "\n  // Real SQL Auth signup"
);

fs.writeFileSync('src/hooks/useAuth.tsx', code);
