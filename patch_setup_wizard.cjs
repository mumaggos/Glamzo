const fs = require('fs');

let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

// Imports
code = code.replace(
  /Upload\} from 'lucide-react';/,
  `Upload, Clock } from 'lucide-react';`
);

// State for businessHours
code = code.replace(
  /const \[logoUrl, setLogoUrl\] = useState<string \| null>\(null\);/,
  `const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const DEFAULT_HOURS = [
    { weekday: 1, open_time: '09:00', close_time: '19:00', is_closed: false },
    { weekday: 2, open_time: '09:00', close_time: '19:00', is_closed: false },
    { weekday: 3, open_time: '09:00', close_time: '19:00', is_closed: false },
    { weekday: 4, open_time: '09:00', close_time: '19:00', is_closed: false },
    { weekday: 5, open_time: '09:00', close_time: '19:00', is_closed: false },
    { weekday: 6, open_time: '09:00', close_time: '13:00', is_closed: false },
    { weekday: 0, open_time: '09:00', close_time: '19:00', is_closed: true }
  ];
  const [businessHours, setBusinessHours] = useState(DEFAULT_HOURS);
  
  const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  
  const handleHourChange = (weekday: number, field: string, value: any) => {
    setBusinessHours(prev => prev.map(h => h.weekday === weekday ? { ...h, [field]: value } : h));
  };`
);

// Load business hours
code = code.replace(
  /const \{ data: servicesData \} = await supabase/,
  `const { data: hoursData } = await supabase.from('business_hours').select('*').eq('business_id', currentBiz.id).order('weekday');
          if (hoursData && hoursData.length > 0) {
            setBusinessHours(hoursData);
          }
          const { data: servicesData } = await supabase`
);

// handleNextStep logic updates
code = code.replace(/} else if \(step === 2\) {/g, '} else if (step === 3) {');
code = code.replace(/} else if \(step === 3\) {/g, '} else if (step === 4) {');
code = code.replace(/} else if \(step === 4\) {/g, '} else if (step === 5) {');

// In step 1 logic, we set step 2
// we don't need to change step 1 because it already sets setup_step: 2 and step 2.
// BUT we need to add the new step === 2 logic:
code = code.replace(
  /setBusiness\(\{ \.\.\.business, \.\.\.updateData, setup_step: 2 \}\);\s*setStep\(2\);\s*\} catch \(err: any\) \{\s*setErrorMsg\(err\.message\);\s*\} finally \{\s*setLoading\(false\);\s*\}\s*\} else if \(step === 3\) \{/,
  `setBusiness({ ...business, ...updateData, setup_step: 2 });
        setStep(2);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {
      setLoading(true);
      setErrorMsg('');
      try {
        if (!business) throw new Error('Business not found');
        
        // Save business hours
        const hoursToSave = businessHours.map(h => ({
          ...h,
          business_id: business.id
        }));
        
        // Delete existing to avoid duplicates if they go back and forth
        await supabase.from('business_hours').delete().eq('business_id', business.id);
        
        const { error: hoursErr } = await supabase.from('business_hours').insert(hoursToSave);
        if (hoursErr) throw hoursErr;
        
        const updateData = { setup_step: 3, onboarding_step: 3 };
        await supabase.from('businesses').update(updateData).eq('id', business.id);
        
        setBusiness({ ...business, ...updateData });
        setStep(3);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    } else if (step === 3) {`
);

// update setup_step / onboarding_step inside the old step === 2 (now 3)
code = code.replace(
  /onboarding_step: 3,\s*setup_step: 3/g,
  `onboarding_step: 4,
          setup_step: 4`
);

// inside old step 3 (now 4)
code = code.replace(
  /onboarding_step: 4,\s*setup_step: 4/g,
  `onboarding_step: 5,
            setup_step: 5`
);

// inside old step 4 (now 5)
code = code.replace(
  /onboarding_step: 5,\s*setup_step: 5/g,
  `onboarding_step: 6,
          setup_step: 6`
);
code = code.replace(/setStep\(5\);/g, 'setStep(6);');
code = code.replace(/setStep\(4\);/g, 'setStep(5);');
code = code.replace(/setStep\(3\);/g, 'setStep(4);');
// Wait, replacing setStep(4) to 5 and setStep(3) to 4 will break the newly added one.
// Actually, I already added setStep(3) in my added code block, so replacing setStep(3) -> 4 will break it!
// Let's use regex with exact match to fix this if necessary, or just not do replace global.
