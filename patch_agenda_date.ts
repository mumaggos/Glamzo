import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf-8');

if (!code.includes('ChevronLeft')) {
  code = code.replace(
    'import { Calendar, Sparkles, X, Bell, Plus, CheckCircle, Trash2 } from "lucide-react";',
    'import { Calendar, Sparkles, X, Bell, Plus, CheckCircle, Trash2, ChevronLeft, ChevronRight } from "lucide-react";'
  );
}

const headerTarget = `      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 shrink-0">
        <div><h3 className="text-2xl font-black text-slate-900 flex items-center gap-2"><Sparkles className="w-6 h-6 text-purple-500" /> Agenda</h3></div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">`;

const replacement = `      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 shrink-0 w-full flex-wrap">
        <div><h3 className="text-2xl font-black text-slate-900 flex items-center gap-2"><Sparkles className="w-6 h-6 text-purple-500" /> Agenda</h3></div>
        
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <button onClick={() => {
            const d = new Date(selectedAgendaDate);
            d.setDate(d.getDate() - 1);
            setSelectedAgendaDate([d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-'));
          }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <input 
            type="date" 
            value={selectedAgendaDate} 
            onChange={(e) => setSelectedAgendaDate(e.target.value)}
            className="bg-transparent border-none outline-none font-bold text-sm text-slate-800 text-center w-36 cursor-pointer"
          />
          <button onClick={() => {
            const d = new Date(selectedAgendaDate);
            d.setDate(d.getDate() + 1);
            setSelectedAgendaDate([d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-'));
          }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">`;

code = code.replace(headerTarget, replacement);

fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', code);
console.log("Patched Agenda date navigation");
