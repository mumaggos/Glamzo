const fs = require('fs');
let content = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf8');

content = content.replace(
  /\/\/ Add a notification for unread messages\n        setNotifications\(prev => \{ const others = prev\.filter\(n => n\.id !== 999\); return \[\.\.\.others, \{\n          id: 999,\n          title: "Novas Mensagens Recebidas",\n          desc: \`Você tem \$\{messagesData\.length\} mensagem\(s\) não lida\(s\) de clientes\.\`,\n          time: "Agora"\n        \}\]; \}\);/,
  `// Add a notification for unread messages
        const dismissedMsgCount = parseInt(sessionStorage.getItem('dismissed_messages_count') || '0');
        if (messagesData.length > dismissedMsgCount) {
          setNotifications(prev => { const others = prev.filter(n => n.id !== 999); return [...others, {
            id: 999,
            title: "Novas Mensagens Recebidas",
            desc: \`Você tem \${messagesData.length} mensagem(s) não lida(s) de clientes.\`,
            time: "Agora"
          }]; });
        }`
);

content = content.replace(
  /if \(disputesData && disputesData\.length > 0\) \{\n        setNotifications\(prev => \{ const others = prev\.filter\(n => n\.id !== 888\); return \[\.\.\.others, \{\n          id: 888,\n          title: "Disputas Abertas",\n          desc: \`Existem \$\{disputesData\.length\} disputa\(s\) em aberto que requerem a sua atenção\.\`,\n          time: "Agora"\n        \}\]; \}\);/,
  `if (disputesData && disputesData.length > 0) {
        if (sessionStorage.getItem('dismissed_disputes_count') !== disputesData.length.toString()) {
          setNotifications(prev => { const others = prev.filter(n => n.id !== 888); return [...others, {
            id: 888,
            title: "Disputas Abertas",
            desc: \`Existem \${disputesData.length} disputa(s) em aberto que requerem a sua atenção.\`,
            time: "Agora"
          }]; });
        }`
);

content = content.replace(
  /\} else if \(id === 888\) \{\n      \/\/ Store a flag or the current dispute count\n      sessionStorage\.setItem\('dismissed_disputes', 'true'\);\n    \}/,
  `} else if (id === 888) {
      sessionStorage.setItem('dismissed_disputes_count', notifications.find(n => n.id === 888)?.desc?.match(/\\d+/)?.[0] || '1');
    }`
);

fs.writeFileSync('src/components/partner/PartnerLayout.tsx', content);
