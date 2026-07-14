import re

with open("server.ts", "r") as f:
    text = f.read()

target = r"""            if \(syncedActive\) \{
               saasUpdateData\.status = 'active';
               saasUpdateData\.public_page_enabled = true;
            \} else \{"""

replacement = """            if (syncedActive) {
               saasUpdateData.status = 'active';
               saasUpdateData.public_page_enabled = true;
               
               // --- AFFILIATE PAYOUT LOGIC ---
               try {
                 const { data: referral } = await db
                   .from('affiliate_referrals')
                   .select('*')
                   .eq('referred_business_id', businessId)
                   .eq('status', 'pending')
                   .maybeSingle();

                 if (referral) {
                   // Update referral status
                   await db
                     .from('affiliate_referrals')
                     .update({ status: 'paid' })
                     .eq('id', referral.id);
                   
                   // Find referrer and add 10 EUR to balance
                   const { data: referrer } = await db
                     .from('profiles')
                     .select('affiliate_balance')
                     .eq('id', referral.referrer_id)
                     .maybeSingle();
                     
                   if (referrer) {
                      const newBalance = (referrer.affiliate_balance || 0) + 10;
                      await db.from('profiles').update({ affiliate_balance: newBalance }).eq('id', referral.referrer_id);
                      console.log(`[Affiliate] Added 10 EUR to user ${referral.referrer_id} for referring business ${businessId}`);
                   }
                 }
               } catch (affiliateErr: any) {
                 console.error("[Webhook Affiliate Logic Error]:", affiliateErr.message);
               }
               // -----------------------------
               
            } else {"""

text = re.sub(target, replacement, text)

with open("server.ts", "w") as f:
    f.write(text)
