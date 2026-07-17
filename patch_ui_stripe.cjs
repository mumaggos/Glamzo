const fs = require('fs');

const filesToPatch = [
  'src/pages/partner/tabs/SubscriptionTab.tsx',
  'src/pages/partner/tabs/FinanceTab.tsx'
];

for (const file of filesToPatch) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');

  // Find {!business?.stripe_account_id ? (
  code = code.replace(/\{\!business\?\.stripe_account_id \? \(/g, "{(!business?.stripe_account_id || (stripeStatus && !stripeStatus.charges_enabled)) ? (");

  // Fix the fallback layout to show context when continuing
  code = code.replace(/<h5 className="font-bold text-slate-900 mb-1">Receba Pagamentos Online<\/h5>\s*<p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">\s*Configure a sua conta Glamzo Pay/g, 
  `{business?.stripe_account_id && stripeStatus && !stripeStatus.charges_enabled ? (
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
            )}`);
            
  code = code.replace(/Configurar Conta Bancária/g, "{business?.stripe_account_id ? 'Concluir Registo' : 'Configurar Conta Bancária'}");

  fs.writeFileSync(file, code);
}
