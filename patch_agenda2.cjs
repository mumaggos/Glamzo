const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf8');

const newComplete = `
      if (status === 'completed') {
        const { error } = await supabase.rpc('complete_booking_and_reward', { booking_id_param: selectedBooking.id });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('bookings').update({ booking_status: status }).eq('id', selectedBooking.id);
        if (error) throw error;
      }
`;

code = code.replace(
  /if \(status === 'completed'\) \{[\s\S]*?if \(error\) throw error;\n      \}/,
  newComplete.trim()
);

fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', code);
