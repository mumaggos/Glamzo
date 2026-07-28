const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/HardwareManagerTab.tsx', 'utf8');

const oldButton = `<button 
            onClick={handleOrder}
            disabled={ordering}
            className="w-full py-2.5 px-4 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {ordering && <Loader2 className="w-4 h-4 animate-spin" />}
            Encomendar Terminal
          </button>`;

const newButton = `<button 
            onClick={handleOrder}
            disabled={ordering || !business?.charges_enabled}
            className="w-full py-2.5 px-4 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 flex justify-center items-center gap-2"
            title={!business?.charges_enabled ? "Complete primeiro a ativação da Stripe no ecrã inicial." : "Encomendar o Terminal Físico"}
          >
            {ordering && <Loader2 className="w-4 h-4 animate-spin" />}
            {!business?.charges_enabled ? 'Requer Ativação Stripe' : 'Encomendar Terminal'}
          </button>`;

code = code.replace(oldButton, newButton);
fs.writeFileSync('src/pages/partner/tabs/HardwareManagerTab.tsx', code);
