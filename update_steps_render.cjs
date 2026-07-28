const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

const regex = /\{step === 4 && \([\s\S]*?\}\n        \)\}\n        \{step === 6 && \(/;

const replacement = `{step === 4 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Landmark className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Dados de Faturação e KYC</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto text-sm">
              Para receber pagamentos online e poder encomendar o seu terminal, precisamos de validar a sua entidade comercial através da Stripe.
            </p>

            {(business?.charges_enabled && business?.details_submitted) ? (
               <div className="p-6 border border-emerald-200 bg-emerald-50 rounded-xl max-w-md mx-auto mb-8 flex flex-col items-center">
                 <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                 <h3 className="font-bold text-emerald-900">Identidade Verificada</h3>
                 <p className="text-xs text-emerald-700 mt-2 mb-6">A sua conta Stripe está pronta a receber pagamentos.</p>
                 <button
                    onClick={() => updateSetupStep(5)}
                    className="px-8 py-3 bg-[#635BFF] hover:bg-[#5249ea] text-white rounded-xl font-bold uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-3"
                  >
                    <span>Continuar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
               </div>
            ) : (
              <div className="max-w-md mx-auto text-left space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Nome Legal da Empresa / Titular</label>
                  <input type="text" value={legalName} onChange={e => setLegalName(e.target.value)} className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Ex: Glamzo Unipessoal Lda" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">NIF</label>
                  <input type="text" value={nif} onChange={e => setNif(e.target.value)} className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Ex: 500000000" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">IBAN</label>
                  <input type="text" value={iban} onChange={e => setIban(e.target.value)} className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="PT50..." />
                </div>

                <div className="pt-4">
                  <button
                    onClick={triggerStripeOnboarding}
                    disabled={loading || !legalName.trim() || !nif.trim() || !iban.trim()}
                    className="w-full px-8 py-3.5 bg-[#635BFF] hover:bg-[#5249ea] text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Verificar Identidade na Stripe</span><ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </div>
            )}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <button
                type="button"
                onClick={() => updateSetupStep(3)}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Plano Pro e Equipamento</h2>
            
            <div className="grid grid-cols-1 gap-6 mb-8">
              <div className="relative p-6 rounded-2xl border-2 border-purple-600 bg-purple-50/50 shadow-md">
                <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wider">
                  Recomendado
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <input type="radio" checked={!wantsTerminal} onChange={() => setWantsTerminal(false)} className="w-5 h-5 text-purple-600 border-slate-300 focus:ring-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      Apenas Software (14 dias grátis)
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">29€ / mês ou 299€ / ano após período grátis. Acesso total a todas as funcionalidades do Glamzo Business.</p>
                  </div>
                </div>
              </div>

              <div className="relative p-6 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white transition-colors cursor-pointer" onClick={() => setWantsTerminal(true)}>
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <input type="radio" checked={wantsTerminal} onChange={() => setWantsTerminal(true)} className="w-5 h-5 text-purple-600 border-slate-300 focus:ring-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-slate-700" />
                      Software + Terminal Físico
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 mb-3">59€ / mês. Inclui o terminal de pagamento Android de última geração com impressora integrada.</p>
                  </div>
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
            
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <button
                type="button"
                onClick={() => updateSetupStep(4)}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleNext}
                className="w-full px-6 py-3.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md flex items-center justify-center gap-2 flex-1"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>{wantsTerminal ? 'Confirmar Pedido' : 'Começar 14 Dias Grátis'}</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}
        {step === 6 && (`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
