import re

with open("src/pages/partner/SetupWizard.tsx", "r") as f:
    text = f.read()

# Add ref parsing
ref_parse = """  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref');"""
text = text.replace("  const navigate = useNavigate();", ref_parse)

# Update business creation
biz_target = r"""        const \{ data: newBiz, error: createErr \} = await supabase\.from\('businesses'\)\.insert\(payload\)\.select\(\)\.single\(\);
          
        if \(createErr\) \{"""
biz_replace = """        const { data: newBiz, error: createErr } = await supabase.from('businesses').insert(payload).select().single();
          
        if (!createErr && newBiz && refCode) {
          try {
            // Find referrer
            const { data: referrer } = await supabase.from('profiles').select('id').eq('referral_code', refCode).maybeSingle();
            if (referrer) {
              await supabase.from('affiliate_referrals').insert({
                referrer_id: referrer.id,
                referred_business_id: newBiz.id,
                status: 'pending'
              });
            }
          } catch (e) {
            console.error('Error recording referral:', e);
          }
        }

        if (createErr) {"""
text = re.sub(biz_target, biz_replace, text)

with open("src/pages/partner/SetupWizard.tsx", "w") as f:
    f.write(text)
