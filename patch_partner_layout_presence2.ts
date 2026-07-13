import * as fs from 'fs';
let content = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf8');

const presenceTarget = `const { user, profile, signOut, loading: authLoading } = useAuth();`;
const presenceReplacement = `const { user, profile, signOut, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    // Update presence initially and every minute
    const updatePresence = async () => {
      try {
        await supabase
          .from('profiles')
          .update({ last_active: new Date().toISOString() })
          .eq('id', user.id);
      } catch (err) {
        console.error("Failed to update presence:", err);
      }
    };
    
    updatePresence();
    const interval = setInterval(updatePresence, 60000);
    return () => clearInterval(interval);
  }, [user]);`;

if (content.includes(presenceTarget) && !content.includes('updatePresence')) {
  content = content.replace(presenceTarget, presenceReplacement);
  fs.writeFileSync('src/components/partner/PartnerLayout.tsx', content);
  console.log("Patched PartnerLayout.tsx presence heartbeat successfully");
} else {
  console.log("Could not find target or already patched");
}
