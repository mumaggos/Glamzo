const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', 'utf8');

const target1 = `        {(!business?.stripe_account_id || (stripeStatus && !stripeStatus.charges_enabled)) ? (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-6 h-6 text-emerald-600" />
            </div>
            {business?.stripe_account_id && stripeStatus && !stripeStatus.charges_enabled ? (`;

const replacement1 = `        {(!business?.stripe_account_id || (stripeStatus && (!stripeStatus.charges_enabled || stripeStatus.connected === false))) ? (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-6 h-6 text-emerald-600" />
            </div>
            {business?.stripe_account_id && stripeStatus && stripeStatus.connected !== false && !stripeStatus.charges_enabled ? (`;

code = code.replace(target1, replacement1);

const target2 = `            <button
              onClick={handleConnectStripe}
              className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 mx-auto"
            >
              {business?.stripe_account_id ? 'Concluir Registo' : 'Configurar Conta Bancária'}
            </button>`;

const replacement2 = `            <button
              onClick={handleConnectStripe}
              className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 mx-auto"
            >
              {(business?.stripe_account_id && stripeStatus?.connected !== false) ? 'Concluir Registo' : 'Configurar Conta Bancária'}
            </button>`;

code = code.replace(target2, replacement2);

fs.writeFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', code);
console.log("SubscriptionTab patched!");
