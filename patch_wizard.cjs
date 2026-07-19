const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

const targetBlock = `        const updateData = {
          id: business.id,
          owner_id: user.id,
          name, phone, email, address, door_number: doorNumber || null, city, district: district || city, postal_code: postalCode, slug, setup_step: 2,
          category, logo_url: logoUrl, cover_url: coverUrl,
          latitude: lat, longitude: lng,
          onboarding_step: 2
        };
        const { error } = await supabase.from('businesses').upsert(updateData);
        
        if (error) {
          if (error.code === '42703' || error.message?.includes('setup_step')) {
            delete (updateData as any).setup_step;
            await supabase.from('businesses').upsert(updateData);
          } else {
            throw error;
          }
        }`;

const replacementBlock = `        const updateData = {
          name, phone, email, address, door_number: doorNumber || null, city, district: district || city, postal_code: postalCode, slug, setup_step: 2,
          category, logo_url: logoUrl, cover_url: coverUrl,
          latitude: lat, longitude: lng,
          onboarding_step: 2
        };
        const { error } = await supabase.from('businesses').update(updateData).eq('id', business.id);
        
        if (error) {
          if (error.code === '42703' || error.message?.includes('setup_step')) {
            delete (updateData as any).setup_step;
            const { error: retryError } = await supabase.from('businesses').update(updateData).eq('id', business.id);
            if (retryError) throw retryError;
          } else {
            throw error;
          }
        }`;

code = code.replace(targetBlock, replacementBlock);
fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
console.log('SetupWizard patched');
