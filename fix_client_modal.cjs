const fs = require('fs');
let content = fs.readFileSync('src/components/ClientXRayModal.tsx', 'utf8');

// Modify fetch logic to join with businesses
const oldFetch = `      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', client.id)
        .order('start_time', { ascending: false });`;

const newFetch = `      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*, business:businesses(name)')
        .eq('customer_id', client.id)
        .order('start_time', { ascending: false });`;

content = content.replace(oldFetch, newFetch);
fs.writeFileSync('src/components/ClientXRayModal.tsx', content);
console.log('Fixed ClientXRayModal bookings fetch');
