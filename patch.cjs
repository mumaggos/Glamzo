const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

content = content.replace(
  "const [selectedPlan, setSelectedPlan] = useState<'PRO' | 'TERMINAL'>('PRO');",
  "const [wantsTerminal, setWantsTerminal] = useState(false);"
);

content = content.replace(
  /\} else if \(step === 4\) \{[\s\S]*?\/\/ Check trial_used from database to ensure no trial repetition/,
  `} else if (step === 4) {
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
           const { error: tabletError } = await supabase.from('tablet_orders').upsert({
             business_id: business.id,
             shipping_name: shippingName.trim(),
             shipping_phone: shippingPhone.trim(),
             shipping_address: shippingAddress.trim(),
             shipping_city: shippingCity.trim(),
             shipping_postal_code: shippingPostalCode.trim(),
             status: 'pending'
           }, { onConflict: 'business_id' });

           if (tabletError) {
             throw new Error('Falha ao processar encomenda do terminal: ' + tabletError.message);
           }
        }

        const { error: upsertError } = await supabase.from('businesses').update({
          onboarding_step: 4
        }).eq('id', business.id);

        if (upsertError) {
          throw new Error('Falha ao atualizar estado de onboarding: ' + upsertError.message);
        }

        // Check trial_used from database to ensure no trial repetition`
);

content = content.replace(
  /planName: selectedPlan,/,
  "planName: wantsTerminal ? 'TERMINAL' : 'PRO',"
);

const step4RenderMatch = /\{step === 4 && \([\s\S]*?\{step === 5 && \(/;
content = content.replace(
  step4RenderMatch,
  `{step === 4 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Plano Pro e Equipamento</h2>
            
            <div className="grid grid-cols-1 gap-6 mb-8">
              <div className="relative p-6 rounded-2xl border-2 border-purple-600 bg-purple-50/50 shadow-md">
                <div className="absolute top-4 right-4 text-purple-600"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg font-bold text-slate-900">Aderir ao Plano Pro</h3>
                <div className="my-3"><span className="text-3xl font-black">19,90€</span><span className="text-slate-500 text-sm">{t('setupWizard.perMonth')}</span></div>
                <div className="mb-4">
                  <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">{t('setupWizard.free14Days')}</span>
                </div>
                <ul className="space-y-2 mt-4 text-sm text-slate-600">
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Agenda Inteligente e SEO</li>
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Pagamentos por MB Way e Cartões (Tap to Pay)</li>
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> <strong>Comissões Zero</strong></li>
                </ul>
              </div>

              <div 
                className={\`relative p-6 rounded-2xl border-2 transition-all cursor-pointer \${wantsTerminal ? 'border-purple-600 bg-purple-50/50 shadow-md' : 'border-slate-200 hover:border-purple-300'}\`}
                onClick={() => setWantsTerminal(!wantsTerminal)}
              >
                <div className="absolute top-0 right-0 bg-slate-900 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-bl-xl rounded-tr-xl">
                  {t('setupWizard.recommendedBadge')}
                </div>
                <div className={\`absolute top-4 right-4 \${wantsTerminal ? 'text-purple-600' : 'text-slate-300'}\`}>
                   {wantsTerminal ? <CheckCircle className="w-6 h-6" /> : <div className="w-6 h-6 rounded-full border-2 border-slate-300"></div>}
                </div>
                <h3 className="text-lg font-bold text-slate-900">Terminal de Pagamentos Dedicado</h3>
                <div className="my-3"><span className="text-3xl font-black">99,00€</span><span className="text-slate-500 text-sm"> {t('setupWizard.uniquePayment')}</span></div>
                <div className="mb-4 flex flex-col gap-1">
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded w-max">{t('setupWizard.featureShippingIncluded')}</span>
                </div>
                <ul className="space-y-2 text-sm text-slate-600 mb-4">
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Pagamentos diretos para o terminal físico</li>
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Contactless, Chip e Banda Magnética</li>
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> {t('setupWizard.featureDirectIntegration')}</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-slate-200/50 text-xs font-semibold text-slate-500">
                  {t('setupWizard.terminalForever')}
                </div>
              </div>
            </div>

            {wantsTerminal && (
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
                <h4 className="font-bold text-slate-900 mb-4">{t('setupWizard.shippingDataTitle')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder={t('setupWizard.shippingNamePlaceholder')} value={shippingName} onChange={e => setShippingName(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" />
                  <input type="text" placeholder={t('setupWizard.shippingPhonePlaceholder')} value={shippingPhone} onChange={e => setShippingPhone(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" />
                  <input type="text" placeholder={t('setupWizard.shippingAddressPlaceholder')} value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm md:col-span-2" />
                  <input type="text" placeholder={t('setupWizard.shippingPostalCodePlaceholder')} value={shippingPostalCode} onChange={e => setShippingPostalCode(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" />
                  <input type="text" placeholder={t('setupWizard.shippingCityPlaceholder')} value={shippingCity} onChange={e => setShippingCity(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
              </div>
            )}
            
            <p className="text-xs text-slate-500 text-center">{t('setupWizard.stripeRedirectPay')}</p>
            
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <button
                type="button"
                onClick={() => updateSetupStep(step - 1)}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('setupWizard.backBtn')}</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleNext}
                className="w-full px-6 py-3.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md flex items-center justify-center gap-2 flex-1"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>{wantsTerminal ? t('setupWizard.proceedToPayment') : t('setupWizard.start14DaysFree')}</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}

        {step === 5 && (`
);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', content);
