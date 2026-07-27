const fs = require('fs');
let content = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf8');

// Add toast import if not exists
if (!content.includes("import toast from")) {
  content = content.replace(
    'import { useAuth } from "../../hooks/useAuth";',
    'import { useAuth } from "../../hooks/useAuth";\nimport toast from "react-hot-toast";'
  );
}

const match = /const loadLayoutData = async \(\) => \{[\s\S]*?\} catch \(err\) \{ console\.error\(err\); \} finally \{ setIsLoadingData\(false\); \}\n  \};/;

const replacement = `const loadLayoutData = async () => {
    setIsLoadingData(true);
    if (!user) return;
    try {
      const { data: bData, error: bError } = await supabase.from("businesses").select("*").eq("owner_id", user.id).maybeSingle();
      if (bError) {
        toast.error('Erro ao carregar loja: ' + bError.message);
        return;
      }
      if (!bData) { navigate("/partner/setup", { replace: true }); return; }
      setBusiness(bData);

      const { data: tData, error: tError } = await supabase.from("hardware_orders").select("*").eq("business_id", bData.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (tError) {
        toast.error('Erro ao carregar equipamento: ' + tError.message);
        return;
      }
      if (tData) setTabletOrder(tData);

      const [catRes, svRes, stRes, bkRes, bhRes] = await Promise.all([
        supabase.from("service_categories").select("*").eq("business_id", bData.id).order("order_index"),
        supabase.from("services").select("*").eq("business_id", bData.id).order("name"),
        supabase.from("staff").select("*").eq("business_id", bData.id).eq("is_active", true).order("full_name"),
        (() => {
          const now = new Date();
          const start = new Date(now);
          start.setDate(now.getDate() - 30);
          const end = new Date(now);
          end.setDate(now.getDate() + 90);
          return supabase.from("bookings")
            .select(\`*, service:services(name, price, duration_minutes), staff:staff(full_name), customer_profile:profiles(full_name, avatar_url, email, phone)\`)
            .eq("business_id", bData.id)
            .neq('booking_status', 'cancelled')
            .neq('booking_status', 'pending')
            .order("booking_date", { ascending: false })
            .order("start_time", { ascending: false })
            .limit(3000);
        })(),
        supabase.from("business_hours").select("*").eq("business_id", bData.id)
      ]);

      if (catRes.error) { toast.error('Erro ao carregar categorias: ' + catRes.error.message); return; }
      if (svRes.error) { toast.error('Erro ao carregar serviços: ' + svRes.error.message); return; }
      if (stRes.error) { toast.error('Erro ao carregar equipa: ' + stRes.error.message); return; }
      if (bkRes.error) { toast.error('Erro ao carregar reservas: ' + bkRes.error.message); return; }
      if (bhRes.error) { toast.error('Erro ao carregar horários: ' + bhRes.error.message); return; }

      setCategories(catRes.data); 
      setServices(svRes.data); 
      setStaff(stRes.data); 
      setBookings(bkRes.data);
      setBusinessHours(bhRes.data);
      
      setBookingsTodayCount((bkRes.data).filter(b => b.booking_date === new Date().toISOString().split("T")[0]).length);

      const { data: messagesData, error: msgError } = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, is_read, content")
        .eq("receiver_id", user.id)
        .eq("is_read", false);
        
      if (msgError) {
         toast.error('Erro ao carregar mensagens: ' + msgError.message);
         return;
      }

      if (messagesData && messagesData.length > 0) {
        setUnreadMessages(messagesData.length);
        
        // Count by customer (for future use or notifications)
        const counts = {};
        messagesData.forEach(m => {
           counts[m.sender_id] = (counts[m.sender_id] || 0) + 1;
        });
        setUnreadCountByCustomer(counts);
        
        // Add a notification for unread messages
        const dismissedMsgCount = parseInt(sessionStorage.getItem('dismissed_messages_count') || '0');
        if (messagesData.length > dismissedMsgCount) {
          setNotifications(prev => { const others = prev.filter(n => n.id !== 999); return [...others, { id: 999, title: t('partner.newMessages'), desc: \`Tem \${messagesData.length} mensagens não lidas\`, time: t('partner.timeNow') }]; });
        }
      } else {
        setUnreadMessages(0);
        setUnreadCountByCustomer({});
      }
    } catch (err) { 
      toast.error('Falha de sistema ao carregar painel');
      console.error(err); 
    } finally { 
      setIsLoadingData(false); 
    }
  };`;

if (!match.test(content)) {
  console.error("Match not found!");
  process.exit(1);
}

content = content.replace(match, replacement);
fs.writeFileSync('src/components/partner/PartnerLayout.tsx', content);
console.log("Done");
