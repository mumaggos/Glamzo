const fs = require('fs');
let code = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf8');

const targetLogic = `  const hasValidSubscription = !business || business.subscription_status === 'active' || (business.subscription_status === 'trialing' && business.trial_ends_at && new Date(business.trial_ends_at) > new Date());

  useEffect(() => {
    if (business && !hasValidSubscription && !location.pathname.includes('/subscricao')) {
      navigate('/partner/dashboard/subscricao', { replace: true });
    }
  }, [business, hasValidSubscription, location.pathname, navigate]);`;

const replacementLogic = `  const hasValidSubscription = !business || (
    business.subscription_active !== false && 
    business.subscription_status !== 'canceled' &&
    business.subscription_status !== 'expired'
  );

  useEffect(() => {
    if (business && !hasValidSubscription && !location.pathname.includes('/setup')) {
      navigate('/partner/setup', { replace: true });
    }
  }, [business, hasValidSubscription, location.pathname, navigate]);`;

code = code.replace(targetLogic, replacementLogic);

const targetBanner = `      <main className="flex-1 flex flex-col h-full relative isolate overflow-x-hidden w-full">
        <div className="relative z-[99999] h-16 px-4 sm:px-8 flex items-center justify-between shrink-0 bg-white/50 backdrop-blur-md pt-4 border-b border-slate-100/50">`;

const replacementBanner = `      <main className="flex-1 flex flex-col h-full relative isolate overflow-x-hidden w-full">
        {business && business.subscription_active !== false && business.subscription_status !== 'canceled' && !business.stripe_account_id && (
          <div className="bg-rose-500 text-white px-4 py-3 text-center text-sm font-bold shadow-sm relative z-[999999] animate-in fade-in slide-in-from-top-4">
            ⚠️ Ação Necessária: A sua conta bancária foi desconectada. <Link to="/partner/dashboard/subscricao" className="underline decoration-2 underline-offset-2">Clique aqui para voltar a conectar e receber os seus fundos.</Link>
          </div>
        )}
        <div className="relative z-[99999] h-16 px-4 sm:px-8 flex items-center justify-between shrink-0 bg-white/50 backdrop-blur-md pt-4 border-b border-slate-100/50">`;

code = code.replace(targetBanner, replacementBanner);

fs.writeFileSync('src/components/partner/PartnerLayout.tsx', code);
console.log("Layout patched!");
