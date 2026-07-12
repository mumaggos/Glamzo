import * as fs from 'fs';

let content = fs.readFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', 'utf8');

const trialVars = `  const { business, staff } = useOutletContext<PartnerContextType>();
  const hasUsedTrial = business?.subscription_status === 'canceled' || business?.subscription_status === 'past_due' || (business?.trial_ends_at && new Date(business.trial_ends_at) < new Date());
  const isSuspended = business?.subscription_status === 'canceled' || business?.subscription_status === 'past_due' || (business?.subscription_status === 'trialing' && hasUsedTrial);
`;

content = content.replace(
  `  const { business, staff } = useOutletContext<PartnerContextType>();`,
  trialVars
);

const suspendBanner = `      <div className="border-b border-slate-100 pb-5 text-left">
        <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
          Subscrição e Faturação
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Acompanhe a sua subscrição Glamzo Pro, consulte faturas reais e verifique o estado do seu Glamzo Pay Connect.
        </p>
      </div>

      {isSuspended && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5"/>
          <div>
            <h4 className="text-sm font-bold text-rose-900">Loja Suspensa</h4>
            <p className="text-xs text-rose-700 mt-1">O seu período de utilização expirou ou a sua subscrição foi cancelada. A sua página pública não está visível. Selecione um plano para reativar de imediato.</p>
          </div>
        </div>
      )}
`;

content = content.replace(
  `      <div className="border-b border-slate-100 pb-5 text-left">
        <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
          Subscrição e Faturação
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Acompanhe a sua subscrição Glamzo Pro, consulte faturas reais e verifique o estado do seu Glamzo Pay Connect.
        </p>
      </div>`,
  suspendBanner
);

content = content.replace(
  `body: JSON.stringify({ businessId: business.id, planName: planName }),`,
  `body: JSON.stringify({ businessId: business.id, planName: planName, skipTrial: hasUsedTrial }),`
);

content = content.replace(
  `          <div className="mt-4 mb-6">
            <span className="text-4xl font-black text-slate-900">19.90€</span>
            <span className="text-sm font-bold text-slate-500"> / mês</span>
          </div>`,
  `          <div className="mt-4 mb-6 flex flex-wrap items-center gap-3">
            <div>
              <span className="text-4xl font-black text-slate-900">19.90€</span>
              <span className="text-sm font-bold text-slate-500"> / mês</span>
            </div>
            {!hasUsedTrial ? (
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-md uppercase">14 Dias Grátis</span>
            ) : (
              <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-1 rounded-md uppercase">Cobrança Imediata</span>
            )}
          </div>`
);

content = content.replace(
  `          <div className="mt-4 mb-6 relative z-10">
            <span className="text-4xl font-black text-white">24.90€</span>
            <span className="text-sm font-bold text-slate-400"> / mês</span>
            <div className="mt-2 inline-block bg-white/10 px-3 py-1 rounded-lg border border-white/10">
              <span className="text-xs font-bold text-purple-300">+ 9.90€ Caução Única (Equipamento)</span>
            </div>
          </div>`,
  `          <div className="mt-4 mb-6 relative z-10">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <span className="text-4xl font-black text-white">24.90€</span>
                <span className="text-sm font-bold text-slate-400"> / mês</span>
              </div>
              {!hasUsedTrial ? (
                <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase shadow-lg">14 Dias Grátis</span>
              ) : (
                <span className="bg-slate-700 text-slate-300 text-[10px] font-black px-2 py-1 rounded-md uppercase shadow-inner">Cobrança Imediata</span>
              )}
            </div>
            <div className="mt-2 inline-block bg-white/10 px-3 py-1 rounded-lg border border-white/10">
              <span className="text-xs font-bold text-purple-300">+ 9.90€ Caução Única (Equipamento)</span>
            </div>
          </div>`
);

fs.writeFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', content);
console.log("Patched SubscriptionTab");

