const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

// Replace handleNext for step 3 to go to step 4 without autosave to 5, and step 4 logic.
const nextRegex = /\} else if \(step === 3\) \{[\s\S]*?\} else if \(step === 4\) \{[\s\S]*?\} else if \(step === 5\) \{[\s\S]*?\} catch \(err\) \{\n        console\.warn\('Autosave step 4 failed:', err\);\n      \}\n      await updateSetupStep\(5\);\n    \}\n  \};/;

const newNextLogic = `} else if (step === 3) {
      if (services.length === 0) {
        setErrorMsg(t('setupWizard.errAddOneService'));
        return;
      }
      try {
        const updateData = {
          onboarding_step: 3,
          setup_step: 4,
          manual_setup_requested: business.manual_setup_requested
        };
        await supabase.from('businesses').update(updateData).eq('id', business.id);
        setBusiness({ ...business, ...updateData });
        setStep(4);
      } catch (err) {
        console.warn('Autosave step 3 failed:', err);
      }
    } else if (step === 4) {
      // Step 4 is handled directly by triggerStripeOnboarding and updateSetupStep(5)
    } else if (step === 5) {
      if (wantsTerminal) {
        if (!shippingName.trim() || !shippingPhone.trim() || !shippingAddress.trim() || !shippingCity.trim() || !shippingPostalCode.trim()) {
          setErrorMsg(t('setupWizard.errShippingData'));
          return;
        }
      }
      
      setLoading(true);
      try {
        const { error: updateError } = await supabase.from('businesses').update({ 
          selected_plan: wantsTerminal ? 'app_tablet' : 'pro',
          tablet_requested: wantsTerminal
        }).eq('id', business.id);
        if (updateError) {
          throw new Error('Falha ao atualizar o plano: ' + updateError.message);
        }
        
        if (wantsTerminal) {
           let tabletError = null;
           if (tabletOrderId) {
             const res = await supabase.from('tablet_orders').update({
               shipping_name: shippingName.trim(),
               shipping_phone: shippingPhone.trim(),
               shipping_address: shippingAddress.trim(),
               shipping_city: shippingCity.trim(),
               shipping_postal_code: shippingPostalCode.trim(),
               status: 'pending'
             }).eq('id', tabletOrderId);
             tabletError = res.error;
           } else {
             const res = await supabase.from('tablet_orders').insert({
               business_id: business.id,
               shipping_name: shippingName.trim(),
               shipping_phone: shippingPhone.trim(),
               shipping_address: shippingAddress.trim(),
               shipping_city: shippingCity.trim(),
               shipping_postal_code: shippingPostalCode.trim(),
               deposit_amount: 0,
               status: 'pending'
             }).select('id').single();
             tabletError = res.error;
             if (res.data) setTabletOrderId(res.data.id);
           }
           if (tabletError) {
             throw new Error('Falha ao processar encomenda do terminal: ' + tabletError.message);
           }
        }

        const { error: upsertError } = await supabase.from('businesses').update({
          onboarding_step: 6,
          setup_step: 6
        }).eq('id', business.id);

        if (upsertError) {
          throw new Error('Falha ao atualizar estado de onboarding: ' + upsertError.message);
        }

        // Move to final step
        setBusiness({ ...business, onboarding_step: 6, setup_step: 6 });
        setStep(6);
      } catch (err: any) {
        console.warn('Step 5 failed:', err);
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    }
  };`;

code = code.replace(nextRegex, newNextLogic);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
