const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

// 1. Fix updateSetupStep logic
const oldUpdateSetupStep = `  const updateSetupStep = async (newStep: number) => {
    if (!business) return;
    
    let targetStep = newStep;
    if (targetStep === 3 && (business.subscription_active || business.stripe_subscription_id)) {
      if (step === 4) { 
        targetStep = 2; 
      } else {
        targetStep = 4; 
      }
    }

    try {
      await supabase.from('businesses').update({ setup_step: targetStep }).eq('id', business.id);
    } catch (e) {
      console.warn("Could not save setup_step", e);
    }
    setBusiness({ ...business, setup_step: targetStep });
    setStep(targetStep);
  };`;

const newUpdateSetupStep = `  const updateSetupStep = async (newStep: number) => {
    if (!business) return;
    
    let targetStep = newStep;
    if (targetStep === 3 && (business.subscription_active || business.stripe_subscription_id)) {
      if (step === 4) { 
        targetStep = 2; 
      } else {
        targetStep = 4; 
      }
    }

    try {
      await supabase.from('businesses').update({ setup_step: targetStep }).eq('id', business.id);
    } catch (e) {
      console.warn("Could not save setup_step", e);
    }
    setBusiness({ ...business, setup_step: targetStep });
    setStep(targetStep);
  };`;
// Actually, updateSetupStep logic is fine if we pass the correct next step.

// Let's fix step 2 logic:
const step2Old = `        const updateData = { setup_step: 4, onboarding_step: 3 };
        await supabase.from('businesses').update(updateData).eq('id', business.id);
        
        setBusiness({ ...business, ...updateData });
        setStep(3);`;
const step2New = `        const updateData = { setup_step: 3, onboarding_step: 2 };
        await supabase.from('businesses').update(updateData).eq('id', business.id);
        
        setBusiness({ ...business, ...updateData });
        setStep(3);`;
code = code.replace(step2Old, step2New);

// Let's fix step 3 logic:
const step3Old = `      try {
        await supabase.from('businesses').upsert({
          id: business.id,
          owner_id: user.id,
          name, phone, email, address, door_number: doorNumber || null, city, district: district || city, postal_code: postalCode,
          category, logo_url: logoUrl, cover_url: coverUrl,
          latitude: coordinates?.lat || null, longitude: coordinates?.lng || null,
          onboarding_step: 3,
          setup_step: 4,
          manual_setup_requested: setupByGlamzo || business.manual_setup_requested
        });
      } catch (err) {
        console.warn('Autosave step 2 failed:', err);
      }
      await updateSetupStep(3);`;
const step3New = `      try {
        const updateData = {
          onboarding_step: 3,
          setup_step: 4,
          manual_setup_requested: setupByGlamzo || business.manual_setup_requested
        };
        await supabase.from('businesses').update(updateData).eq('id', business.id);
        setBusiness({ ...business, ...updateData });
        setStep(4);
      } catch (err) {
        console.warn('Autosave step 3 failed:', err);
      }`;
code = code.replace(step3Old, step3New);

// Fix the useEffect for saving draft:
const saveDraftOld = `  useEffect(() => {
    if (loading) return;
    const draft = { name, phone, email, address, doorNumber, city, district, postalCode, category, logoUrl };
    localStorage.setItem('setup_wizard_draft', JSON.stringify(draft));
  }, [name, phone, email, address, doorNumber, city, district, postalCode, category, logoUrl, loading]);`;

const saveDraftNew = `  useEffect(() => {
    if (loading) return;
    const draft = { step, name, phone, email, address, doorNumber, city, district, postalCode, category, logoUrl, businessHours, setupByGlamzo };
    localStorage.setItem('setup_wizard_draft', JSON.stringify(draft));
  }, [step, name, phone, email, address, doorNumber, city, district, postalCode, category, logoUrl, businessHours, setupByGlamzo, loading]);`;
code = code.replace(saveDraftOld, saveDraftNew);

// Fix draft restoring logic
const loadDraftOld = `        if (currentBiz.latitude && currentBiz.longitude) {
          setCoordinates({ lat: currentBiz.latitude, lng: currentBiz.longitude });
        }
        
        const stepParam = searchParams.get('step');
        if (stepParam) {
           const parsedStep = parseInt(stepParam);
           if (!isNaN(parsedStep)) {
              setStep(parsedStep);
              if (currentBiz.setup_step !== parsedStep) {
                 try {
                   await supabase.from('businesses').update({ setup_step: parsedStep }).eq('id', currentBiz.id);
                   currentBiz.setup_step = parsedStep;
                 } catch (e) {}
              }
           }
        } else if (!searchParams.get('status') && currentBiz.setup_step) {
          let targetStep = currentBiz.setup_step;
          if (targetStep === 3 && (currentBiz.subscription_active || currentBiz.stripe_subscription_id)) {
            targetStep = 4;
          }
          setStep(targetStep);
        }`;
const loadDraftNew = `        if (currentBiz.latitude && currentBiz.longitude) {
          setCoordinates({ lat: currentBiz.latitude, lng: currentBiz.longitude });
        }
        
        if (draft?.businessHours && draft.businessHours.length > 0) {
          setBusinessHours(draft.businessHours);
        }
        if (draft?.setupByGlamzo !== undefined) {
          setSetupByGlamzo(draft.setupByGlamzo);
        }
        
        const stepParam = searchParams.get('step');
        if (stepParam) {
           const parsedStep = parseInt(stepParam);
           if (!isNaN(parsedStep)) {
              setStep(parsedStep);
              if (currentBiz.setup_step !== parsedStep) {
                 try {
                   await supabase.from('businesses').update({ setup_step: parsedStep }).eq('id', currentBiz.id);
                   currentBiz.setup_step = parsedStep;
                 } catch (e) {}
              }
           }
        } else if (!searchParams.get('status')) {
          let targetStep = currentBiz.setup_step || 1;
          
          if (draft?.step && draft.step > targetStep && draft.step <= 4) {
             targetStep = draft.step;
          }
          
          if (targetStep === 3 && (currentBiz.subscription_active || currentBiz.stripe_subscription_id)) {
            targetStep = 4;
          }
          setStep(targetStep);
        }`;
code = code.replace(loadDraftOld, loadDraftNew);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
console.log('SetupWizard step 4 patched.');
