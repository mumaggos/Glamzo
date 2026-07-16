const fs = require('fs');
let code = fs.readFileSync('src/utils/rewardsHelper.ts', 'utf8');

const newInsert = `
    const expiresDate = new Date();
    expiresDate.setFullYear(expiresDate.getFullYear() + 1);

    // Insert history
    const { error: insertError } = await supabase.from('points_history').insert({
      user_id: booking.customer_id,
      points: pointsToAward,
      description: \`Reserva #\${booking.id.split('-')[0]}\`,
      booking_id: booking.id,
      expires_at: expiresDate.toISOString()
    });
`;

code = code.replace(/\/\/ Insert history[\s\S]*?\}\);/, newInsert.trim());
fs.writeFileSync('src/utils/rewardsHelper.ts', code);
