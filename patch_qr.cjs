const fs = require('fs');
let code = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8');

const qrLogic = `
        if (data) {
          if (data.subscription_status === 'suspended') {
            setErrorMsg('Estabelecimento suspenso temporariamente.');
          } else {
            setBusiness(data as Business);
            
            // Check for QR referral
            const ref = searchParams.get('ref');
            if (ref === 'qr') {
               // increment qr_scans_count in DB
               supabase.rpc('increment_qr_scans', { p_business_id: data.id })
                 .then(({error}) => {
                   if (error) {
                     // fallback to direct update if rpc doesn't exist
                     const newCount = (data.qr_scans_count || 0) + 1;
                     supabase.from('businesses').update({ qr_scans_count: newCount }).eq('id', data.id).then();
                   }
                 });
            }
          }
`;

code = code.replace(/if \(data\) \{\s*if \(data\.subscription_status === 'suspended'\) \{\s*setErrorMsg\('Estabelecimento suspenso temporariamente\.'\);\s*\} else \{\s*setBusiness\(data as Business\);/, qrLogic);

fs.writeFileSync('src/pages/BusinessDetail.tsx', code);
