import * as fs from 'fs';
let content = fs.readFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', 'utf8');

const targetBanner = `{isSuspended && (
  <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-4 flex-wrap shadow-sm">
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5"/>
      <div>
        <h4 className="text-sm font-bold text-rose-900">Loja Suspensa</h4>
        <p className="text-xs text-rose-700 mt-1">O seu período de utilização expirou ou a sua subscrição foi cancelada. A sua página não está visível.</p>
      </div>
    </div>
    <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/partner/login'; }} className="px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition shadow-sm whitespace-nowrap">
      Terminar Sessão
    </button>
  </div>
)}`;

const newBanner = `{isSuspended && (
  <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-4 flex-wrap shadow-sm">
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5"/>
      <div>
        <h4 className="text-sm font-bold text-rose-900">Loja Suspensa</h4>
        <p className="text-xs text-rose-700 mt-1">O seu período de utilização expirou ou a subscrição foi cancelada. A sua página pública não está visível.</p>
      </div>
    </div>
    <button 
      onClick={async () => { await supabase.auth.signOut(); window.location.href = '/partner/login'; }} 
      className="px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition shadow-sm whitespace-nowrap"
    >
      Terminar Sessão
    </button>
  </div>
)}`;

const targetProBtn = `{isSuspended ? (
            <button onClick={() => handleSubscribePro("PRO")} disabled={isVerifyingSub} className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl text-xs hover:bg-purple-700 transition shadow-lg">
              {isVerifyingSub ? "A carregar..." : "Reativar Plano PRO"}
            </button>
          ) : business?.selected_plan === "app_tablet" ? (
            <button onClick={() => handleSubscribePro("PRO")} disabled={isVerifyingSub} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl text-xs hover:bg-slate-800 transition shadow-lg">
              Fazer Downgrade para Base
            </button>
          ) : (
            <button disabled className="w-full py-3.5 bg-slate-100 text-slate-500 font-bold rounded-xl cursor-not-allowed text-xs">
              O Seu Plano Atual
            </button>
          )}`;

const newProBtn = `{isSuspended ? (
  <button 
    onClick={() => handleSubscribePro("PRO")}
    disabled={isVerifyingSub}
    className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl text-xs hover:bg-purple-700 transition shadow-lg"
  >
    {isVerifyingSub ? "A carregar..." : "Reativar Plano PRO"}
  </button>
) : business?.selected_plan === "app_tablet" ? (
  <button 
    onClick={() => handleSubscribePro("PRO")}
    disabled={isVerifyingSub}
    className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl text-xs hover:bg-slate-800 transition shadow-lg"
  >
    Fazer Downgrade para Base
  </button>
) : (
  <button disabled className="w-full py-3.5 bg-slate-100 text-slate-500 font-bold rounded-xl cursor-not-allowed text-xs">
    O Seu Plano Atual
  </button>
)}`;

const targetTerminalBtn = `{isSuspended ? (
            <button onClick={() => handleSubscribePro("TERMINAL")} disabled={isVerifyingSub} className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-black rounded-xl transition-all shadow-lg shadow-purple-900/50 relative z-10 text-xs">
              {isVerifyingSub ? "A carregar..." : "Reativar com Terminal"}
            </button>
          ) : business?.selected_plan !== "app_tablet" ? (
            <button onClick={() => handleSubscribePro("TERMINAL")} disabled={isVerifyingSub} className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-black rounded-xl transition-all shadow-lg shadow-purple-900/50 relative z-10 text-xs">
              {isVerifyingSub ? "A carregar..." : "Solicitar Upgrade & Terminal"}
            </button>
          ) : (
            <button disabled className="w-full py-3.5 bg-white/10 text-purple-200 font-bold rounded-xl cursor-not-allowed text-xs border border-white/20 relative z-10">
              O Seu Plano Atual
            </button>
          )}`;

const newTerminalBtn = `{isSuspended ? (
  <button 
    onClick={() => handleSubscribePro("TERMINAL")}
    disabled={isVerifyingSub}
    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-black rounded-xl transition-all shadow-lg shadow-purple-900/50 relative z-10 text-xs"
  >
    {isVerifyingSub ? "A carregar..." : "Reativar com Terminal"}
  </button>
) : business?.selected_plan !== "app_tablet" ? (
  <button 
    onClick={() => handleSubscribePro("TERMINAL")}
    disabled={isVerifyingSub}
    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-black rounded-xl transition-all shadow-lg shadow-purple-900/50 relative z-10 text-xs"
  >
    {isVerifyingSub ? "A carregar..." : "Solicitar Upgrade & Terminal"}
  </button>
) : (
  <button disabled className="w-full py-3.5 bg-white/10 text-purple-200 font-bold rounded-xl cursor-not-allowed text-xs border border-white/20 relative z-10">
    O Seu Plano Atual
  </button>
)}`;

content = content.replace(targetBanner, newBanner);
content = content.replace(targetProBtn, newProBtn);
content = content.replace(targetTerminalBtn, newTerminalBtn);

fs.writeFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', content);
console.log("Patched buttons");
