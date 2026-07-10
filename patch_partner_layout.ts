import fs from 'fs';
let code = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf-8');

// Add unreadMessages state
code = code.replace(
  'const [bookingsTodayCount, setBookingsTodayCount] = useState(0);',
  'const [bookingsTodayCount, setBookingsTodayCount] = useState(0);\n  const [unreadMessages, setUnreadMessages] = useState<number>(0);\n  const [unreadCountByCustomer, setUnreadCountByCustomer] = useState<Record<string, number>>({});'
);

// Fetch unread messages
const unreadQuery = `
      const { data: messagesData } = await supabase
        .from("messages")
        .select("id, customer_id, sender, is_read, content")
        .eq("business_id", bData.id)
        .eq("sender", "customer")
        .eq("is_read", false);
        
      if (messagesData && messagesData.length > 0) {
        setUnreadMessages(messagesData.length);
        
        // Count by customer (for future use or notifications)
        const counts = {};
        messagesData.forEach(m => {
           counts[m.customer_id] = (counts[m.customer_id] || 0) + 1;
        });
        setUnreadCountByCustomer(counts);
        
        // Add a notification for unread messages
        setNotifications([{
          id: 999,
          title: "Novas Mensagens Recebidas",
          desc: \`Você tem \${messagesData.length} mensagem(s) não lida(s) de clientes.\`,
          time: "Agora"
        }]);
      } else {
        setUnreadMessages(0);
        setNotifications([]);
      }
`;

code = code.replace(
  'setBookingsTodayCount((bkData || []).filter(b => b.booking_date === new Date().toISOString().split("T")[0]).length);',
  'setBookingsTodayCount((bkData || []).filter(b => b.booking_date === new Date().toISOString().split("T")[0]).length);\n' + unreadQuery
);

// Update nav items to show unread count
code = code.replace(
  '<span>{tab.label}</span></div>',
  '<span>{tab.label}</span>\n                    {tab.id === "mensagens" && unreadMessages > 0 && (\n                      <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadMessages}</span>\n                    )}\n                  </div>'
);

code = code.replace(
  '<tab.icon className="w-4 h-4 mr-3 shrink-0" /> {tab.label}',
  '<tab.icon className="w-4 h-4 mr-3 shrink-0" /> {tab.label}\n                    {tab.id === "mensagens" && unreadMessages > 0 && (\n                      <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadMessages}</span>\n                    )}'
);

// Also add a realtime listener in PartnerLayout
const realtimeSnippet = `
  useEffect(() => {
    if (!business) return;
    const channel = supabase.channel('partner_layout_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: \`business_id=eq.\${business.id}\` }, payload => {
        if (payload.new.sender === 'customer') {
          loadLayoutData();
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [business]);
`;
code = code.replace(
  'useEffect(() => { setIsMobileSidebarOpen(false); setIsNotificationsOpen(false); }, [location.pathname]);',
  'useEffect(() => { setIsMobileSidebarOpen(false); setIsNotificationsOpen(false); }, [location.pathname]);\n' + realtimeSnippet
);

fs.writeFileSync('src/components/partner/PartnerLayout.tsx', code);
