const fs = require('fs');

let code = fs.readFileSync('src/components/DashboardMessages.tsx', 'utf8');

// Use a ref for selectedCustomer to avoid recreating the channel
code = code.replace(
  /const \[selectedCustomerId, setSelectedCustomerId\] = useState<string \| null>\(null\);/,
  `const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const selectedCustomerRef = useRef<string | null>(null);
  useEffect(() => { selectedCustomerRef.current = selectedCustomerId; }, [selectedCustomerId]);`
);

// We need to import useRef if not imported
if (!code.includes('useRef')) {
  code = code.replace(/import React, \{ useState, useEffect \} from 'react';/, "import React, { useState, useEffect, useRef } from 'react';");
}

// Modify the channel effect to only depend on businessId
code = code.replace(
  /useEffect\(\(\) => \{\n    loadConversations\(\);\n\n    const channel = supabase\.channel\('business_dashboard_messages'\)[\s\S]*?\}\n      \)\n      \.subscribe\(\);\n    \n    return \(\) => \{ supabase\.removeChannel\(channel\); \};\n  \}, \[businessId, selectedCustomerId\]\);/,
  `useEffect(() => {
    loadConversations();

    const channel = supabase.channel('business_dashboard_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: \`business_id=eq.\${businessId}\`
      }, (payload) => {
        const msg = payload.new;
        if (msg.sender_type === 'customer') {
          // Update conversations list right away to show new message preview
          setConversations(prev => {
            const existing = prev.find(c => c.customer_id === msg.customer_id);
            if (existing) {
              return [
                { ...existing, last_message: msg.message, updated_at: msg.created_at },
                ...prev.filter(c => c.customer_id !== msg.customer_id)
              ];
            } else {
              return [
                { customer_id: msg.customer_id, customer_profile: null, last_message: msg.message, updated_at: msg.created_at, sender_name: msg.sender_name },
                ...prev
              ];
            }
          });
          
          setMessages(prev => {
            if (selectedCustomerRef.current === msg.customer_id) {
              if (!prev.find(m => m.id === msg.id)) { 
                return [...prev, msg];
              }
            }
            return prev;
          });
        }
      })
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, [businessId]);`
);

fs.writeFileSync('src/components/DashboardMessages.tsx', code);
