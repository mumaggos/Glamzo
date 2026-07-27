const fs = require('fs');
let content = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf8');

const replaceStr1 = `      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: \`receiver_id=eq.\${business.owner_id}\` }, payload => {
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

const replaceStr2 = `      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: \`receiver_id=eq.\${business.owner_id}\` }, payload => {
        if (payload.eventType === 'INSERT') {
          playNotificationSound();
          setNotifications(prev => [{
            id: Date.now(),
            title: t('partner.newMessages') || 'Nova Mensagem',
            desc: 'Recebeu uma nova mensagem',
            time: t('partner.timeNow') || 'Agora'
          }, ...prev]);
        }
        loadLayoutData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: \`business_id=eq.\${business.id}\` }, payload => {
        if (payload.eventType === 'INSERT') {
          playNotificationSound();
          const startTime = payload.new?.start_time ? payload.new.start_time.substring(0, 5) : '';
          setNotifications(prev => [{
            id: Date.now() + 1,
            title: 'Nova Reserva',
            desc: \`Foi adicionada uma nova reserva às \${startTime}\`,
            time: t('partner.timeNow') || 'Agora'
          }, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          playNotificationSound();
          setNotifications(prev => [{
            id: Date.now() + 1,
            title: 'Reserva Atualizada',
            desc: \`Uma reserva existente sofreu alterações.\`,
            time: t('partner.timeNow') || 'Agora'
          }, ...prev]);
        }
        loadLayoutData();
      })`;

if (content.includes(replaceStr1)) {
    content = content.replace(replaceStr1, replaceStr2);
    fs.writeFileSync('src/components/partner/PartnerLayout.tsx', content);
    console.log("Notifications updated with UPDATE event");
} else {
    console.error("String not found in PartnerLayout.tsx");
}
