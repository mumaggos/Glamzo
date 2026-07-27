const fs = require('fs');
let content = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf8');

// The second channel definition
const searchStr = `.on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: \`receiver_id=eq.\${business.owner_id}\` }, payload => {
        if (payload.eventType === 'INSERT') {
          playNotificationSound();
        }
        // Trigger layout refresh on any message insert/update (like marking as read)
        loadLayoutData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: \`business_id=eq.\${business.id}\` }, payload => {
        if (payload.eventType === 'INSERT') {
          playNotificationSound();
        }
        loadLayoutData();
      })`;

const replaceStr = `.on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: \`receiver_id=eq.\${business.owner_id}\` }, payload => {
        if (payload.eventType === 'INSERT') {
          playNotificationSound();
          setNotifications(prev => [{
            id: Date.now(),
            title: t('partner.newMessages') || 'Nova Mensagem',
            desc: 'Recebeu uma nova mensagem',
            time: t('partner.timeNow') || 'Agora'
          }, ...prev]);
        }
        // Trigger layout refresh on any message insert/update (like marking as read)
        loadLayoutData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: \`business_id=eq.\${business.id}\` }, payload => {
        if (payload.eventType === 'INSERT') {
          playNotificationSound();
          setNotifications(prev => [{
            id: Date.now() + 1,
            title: 'Nova Reserva',
            desc: 'Foi adicionada uma nova reserva à sua agenda',
            time: t('partner.timeNow') || 'Agora'
          }, ...prev]);
        }
        loadLayoutData();
      })`;

if (content.includes(searchStr)) {
    content = content.replace(searchStr, replaceStr);
    fs.writeFileSync('src/components/partner/PartnerLayout.tsx', content);
    console.log("Notifications patched successfully.");
} else {
    console.error("String not found in PartnerLayout.tsx");
}
