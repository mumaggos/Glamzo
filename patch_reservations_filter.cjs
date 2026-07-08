const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/ReservationsTab.tsx', 'utf8');

const importsMatch = /import React from 'react';/;
const importsReplacement = `import React, { useState, useMemo } from 'react';`;

content = content.replace(importsMatch, importsReplacement);

const componentStart = /export function ReservationsTab\(\) \{[\s\n]*const \{ bookings \} = useOutletContext<any>\(\);/;
const filterLogic = `export function ReservationsTab() {
  const { bookings } = useOutletContext<any>();
  const [filter, setFilter] = useState("hoje");

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    
    const today = new Date();
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(today);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(yesterday);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfWeekStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(startOfWeek);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfMonthStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(startOfMonth);

    return bookings.filter((b: any) => {
      if (filter === "hoje") return b.booking_date === todayStr;
      if (filter === "ontem") return b.booking_date === yesterdayStr;
      if (filter === "semana") return b.booking_date >= startOfWeekStr;
      if (filter === "mes") return b.booking_date >= startOfMonthStr;
      return true; // todas
    });
  }, [bookings, filter]);
`;

content = content.replace(componentStart, filterLogic);

// Add the filter UI
const uiStart = /<p className="text-slate-500 text-sm font-medium">Histórico completo e próximas marcações\.<\/p>[\s\n]*<\/div>[\s\n]*<\/div>/;
const uiReplacement = `<p className="text-slate-500 text-sm font-medium">Histórico completo e próximas marcações.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-auto">
          {[
            { id: "hoje", label: "Hoje" },
            { id: "ontem", label: "Ontem" },
            { id: "semana", label: "Semana" },
            { id: "mes", label: "Mês" },
            { id: "todas", label: "Todas" }
          ].map(f => (
             <button
               key={f.id}
               onClick={() => setFilter(f.id)}
               className={\`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-xl transition \${filter === f.id ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}\`}
             >
               {f.label}
             </button>
          ))}
        </div>
      </div>`;

content = content.replace(uiStart, uiReplacement);

// Replace bookings.map with filteredBookings.map
content = content.replace(/bookings\.map\(/, 'filteredBookings.map(');

fs.writeFileSync('src/pages/partner/tabs/ReservationsTab.tsx', content);
