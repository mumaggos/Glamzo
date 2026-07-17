const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', 'utf8');

const target = `{business?.stripe_account_id && stripeStatus && !stripeStatus.charges_enabled ? (
              <>
                <h5 className="font-bold text-slate-900 mb-1">Concluir Configuração Glamzo Pay</h5>
                <p className="text-xs text-rose-500 mb-4 max-w-sm mx-auto font-medium">A sua conta foi criada, mas faltam detalhes importantes. Conclua o registo para ativar os pagamentos.</p>
              </>
            ) : (
              <>
                <h5 className="font-bold text-slate-900 mb-1">Receba Pagamentos Online</h5>
                <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                  Configure a sua conta Glamzo Pay
              </>
            )} (via Stripe) para aceitar pagamentos com Cartão, Apple Pay e MBWay através do sistema de reservas.
            </p>`;

const replacement = `{business?.stripe_account_id && stripeStatus && !stripeStatus.charges_enabled ? (
              <>
                <h5 className="font-bold text-slate-900 mb-1">Concluir Configuração Glamzo Pay</h5>
                <p className="text-xs text-rose-500 mb-4 max-w-sm mx-auto font-medium">A sua conta foi criada, mas faltam detalhes importantes. Conclua o registo para ativar os pagamentos.</p>
              </>
            ) : (
              <>
                <h5 className="font-bold text-slate-900 mb-1">Receba Pagamentos Online</h5>
                <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                  Configure a sua conta Glamzo Pay (via Stripe) para aceitar pagamentos com Cartão, Apple Pay e MBWay através do sistema de reservas.
                </p>
              </>
            )}`;

code = code.replace(target, replacement);

fs.writeFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', code);
