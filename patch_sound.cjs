const fs = require('fs');
let content = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf8');

const soundFunc = `
const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (err) {
    console.error("Audio play failed:", err);
  }
};
`;

content = content.replace(
  /export default function PartnerLayout\(\) \{/,
  soundFunc + "\nexport default function PartnerLayout() {"
);

content = content.replace(
  /\.on\('postgres_changes', \{ event: '\*', schema: 'public', table: 'messages', filter: \`receiver_id=eq\.\$\{business\.owner_id\}\` \}, payload => \{/,
  `.on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: \`receiver_id=eq.\${business.owner_id}\` }, payload => {
        if (payload.eventType === 'INSERT') {
          playNotificationSound();
        }`
);

content = content.replace(
  /\.on\('postgres_changes', \{ event: '\*', schema: 'public', table: 'disputes', filter: \`business_id=eq\.\$\{business\.id\}\` \}, payload => \{/,
  `.on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: \`business_id=eq.\${business.id}\` }, payload => {
        if (payload.eventType === 'INSERT') {
          playNotificationSound();
        }
        loadLayoutData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'disputes', filter: \`business_id=eq.\${business.id}\` }, payload => {`
);

fs.writeFileSync('src/components/partner/PartnerLayout.tsx', content);
