const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/FinanceSettingsTab.tsx', 'utf8');

code = code.replace(
  '<p className="text-emerald-700 max-w-lg text-lg">\n            A sua conta Stripe Connect está validada. Já se encontra totalmente habilitado(a) para receber pagamentos online e transferências bancárias automáticas de forma segura.\n          </p>',
  `<p className="text-emerald-700 max-w-lg text-lg mb-6">
            A sua conta Stripe Connect está validada. Já se encontra totalmente habilitado(a) para receber pagamentos online e transferências bancárias automáticas de forma segura.
          </p>
          <a href="/partner/dashboard/subscricao/hardware" className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition">
            Encomendar Terminal Físico
          </a>`
);

fs.writeFileSync('src/pages/partner/tabs/FinanceSettingsTab.tsx', code);
