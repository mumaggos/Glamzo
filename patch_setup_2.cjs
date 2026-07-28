const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

const handleNextMatch = code.indexOf(`} else if (step === 4) {`);
if (handleNextMatch !== -1) {
    const endMatch = code.indexOf(`const handleMagicSetup = async () => {`);
    
    const newLogic = `} else if (step === 4) {
      setLoading(true);
      try {
        const { error: updateError } = await supabase.from('businesses').update({ 
          selected_plan: 'pro',
          tablet_requested: false
        }).eq('id', business.id);
        
        if (updateError) {
          throw new Error('Falha ao atualizar o plano: ' + updateError.message);
        }
        
        // redirect to stripe checkout
        const res = await fetch("/api/stripe/create-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessId: business.id, planName: 'pro', skipTrial: false })
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to create checkout session");
        }
        
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return; // don't set loading false, wait for redirect
        } else {
          throw new Error("No URL returned from checkout session creation");
        }
      } catch (err: any) {
        console.warn('Step 4 failed:', err);
        setErrorMsg(err.message);
        setLoading(false);
      }
    }
  };
  
  `;
    code = code.slice(0, handleNextMatch) + newLogic + code.slice(endMatch);
}

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
