const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/ReservationsTab.tsx', 'utf8');

const stateRegex = /const \[filter, setFilter\] = useState\("hoje"\);/;
const stateReplacement = `const [filter, setFilter] = useState("hoje");
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toISOString().split('T')[0]);`;
content = content.replace(stateRegex, stateReplacement);

const filterLogicRegex = /if \(filter === "mes"\) return b\.booking_date >= startOfMonthStr;\n\s*if \(filter === "pendentes"\) return b\.booking_status === "pending";\n\s*return true; \/\/ todas\n\s*\}\);\n\s*\}, \[bookings, filter\]\);/;
const filterLogicReplacement = `if (filter === "mes") return b.booking_date >= startOfMonthStr;
      if (filter === "pendentes") return b.booking_status === "pending";
      if (filter === "custom") return b.booking_date >= customStartDate && b.booking_date <= customEndDate;
      return true;
    });
  }, [bookings, filter, customStartDate, customEndDate]);`;
content = content.replace(filterLogicRegex, filterLogicReplacement);

const uiRegex = /<div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-auto">[\s\S]*?<\/div>/;
const uiReplacement = `<div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
          {filter === 'custom' && (
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-sm">
              <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="text-xs font-bold text-slate-700 bg-transparent outline-none p-1" />
              <span className="text-slate-300">-</span>
              <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="text-xs font-bold text-slate-700 bg-transparent outline-none p-1" />
            </div>
          )}
          <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs focus:outline-none focus:border-purple-500 shadow-sm">
            <option value="hoje">Hoje</option>
            <option value="ontem">Ontem</option>
            <option value="semana">Esta Semana</option>
            <option value="mes">Este Mês</option>
            <option value="pendentes">Pendentes</option>
            <option value="todas">Todas</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>`;
content = content.replace(uiRegex, uiReplacement);

fs.writeFileSync('src/pages/partner/tabs/ReservationsTab.tsx', content);
