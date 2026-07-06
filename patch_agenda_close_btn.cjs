const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf8');

code = code.replace(
  /<DashboardCalendar/g,
  `{agendaFullScreen && (
          <button 
            onClick={toggleFullScreen}
            className="fixed top-4 right-4 z-[60] bg-slate-900 text-white p-3 rounded-xl shadow-lg hover:bg-black transition flex items-center gap-2"
          >
            <Minimize className="w-5 h-5" />
            <span className="font-bold text-sm hidden sm:inline">Sair de Ecrã Completo</span>
          </button>
        )}
        <DashboardCalendar`
);

fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', code);
