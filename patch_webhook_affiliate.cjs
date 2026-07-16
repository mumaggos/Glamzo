const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetLogic = `
               // --- AFFILIATE PAYOUT LOGIC ---
               try {
                 const invoiceAmountPaid = (invoice as any).amount_paid || 0;
                 if (invoiceAmountPaid > 0) {
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
                        console.log(\`[Affiliate] Added 10 EUR to user \${referral.referrer_id} for referring business \${businessId}\`);
                     }
                   }
                 }
               } catch (affiliateErr: any) {
                 console.error("[Webhook Affiliate Logic Error]:", affiliateErr.message);
               }
               // -----------------------------
`;

code = code.replace(/\/\/ --- AFFILIATE PAYOUT LOGIC ---[\s\S]*?\/\/ -----------------------------/, targetLogic.trim());

fs.writeFileSync('server.ts', code);
