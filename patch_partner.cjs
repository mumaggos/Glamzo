const fs = require('fs');
let content = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf8');
content = content.replace(
  /setUnreadMessages\(0\);\n        setNotifications\(prev => prev.filter\(n => n.id !== 999\)\);\n      }/,
  `setUnreadMessages(0);
        setNotifications(prev => prev.filter(n => n.id !== 999));
      }

      const { data: disputesData } = await supabase
        .from("disputes")
        .select("id")
        .eq("business_id", bData.id)
        .in("status", ["open", "in_review"]);
      if (disputesData && disputesData.length > 0) {
        setNotifications(prev => { const others = prev.filter(n => n.id !== 888); return [...others, {
          id: 888,
          title: "Disputas Abertas",
          desc: \`Existem \${disputesData.length} disputa(s) em aberto que requerem a sua atenção.\`,
          time: "Agora"
        }]; });
      } else {
        setNotifications(prev => prev.filter(n => n.id !== 888));
      }`
);
fs.writeFileSync('src/components/partner/PartnerLayout.tsx', content);
