const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `if (pointsToAdd > 0) {
        const newPoints = (profile?.glamzo_points || 0) + pointsToAdd;
        await supabaseAdmin.from('profiles').update({ glamzo_points: newPoints }).eq('id', booking.customer_id);
      }`;
      
const replacementStr = `if (pointsToAdd > 0) {
        const newPoints = (profile?.glamzo_points || 0) + pointsToAdd;
        await supabaseAdmin.from('profiles').update({ glamzo_points: newPoints }).eq('id', booking.customer_id);
        const expiresDate = new Date();
        expiresDate.setFullYear(expiresDate.getFullYear() + 1);
        await supabaseAdmin.from('points_history').insert({
          user_id: booking.customer_id,
          points: pointsToAdd,
          description: \`Reserva #\${booking.id.split('-')[0]}\`,
          booking_id: booking.id,
          expires_at: expiresDate.toISOString()
        });
      }`;

code = code.replace(targetStr, replacementStr);

const targetStr2 = `if (pointsToAdd > 0) {
        const newPoints = (profile?.glamzo_points || 0) + pointsToAdd;
        await db.from('profiles').update({ glamzo_points: newPoints }).eq('id', booking.customer_id);
      }`;
      
const replacementStr2 = `if (pointsToAdd > 0) {
        const newPoints = (profile?.glamzo_points || 0) + pointsToAdd;
        await db.from('profiles').update({ glamzo_points: newPoints }).eq('id', booking.customer_id);
        const expiresDate = new Date();
        expiresDate.setFullYear(expiresDate.getFullYear() + 1);
        await db.from('points_history').insert({
          user_id: booking.customer_id,
          points: pointsToAdd,
          description: \`Reserva #\${booking.id.split('-')[0]}\`,
          booking_id: booking.id,
          expires_at: expiresDate.toISOString()
        });
      }`;
      
code = code.replace(targetStr2, replacementStr2);

fs.writeFileSync('server.ts', code);
