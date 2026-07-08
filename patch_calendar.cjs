const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardCalendar.tsx', 'utf8');

const replacement = `              <span className="w-16 md:w-20 text-[11px] font-mono text-slate-400 font-bold pt-2 text-center shrink-0">{hour}:00</span>

              {/* Grid lines 15, 30, 45 */}
              <div className="absolute left-16 md:left-20 right-0 top-1/4 h-[1px] bg-slate-100/50"></div>
              <div className="absolute left-16 md:left-20 right-0 top-2/4 h-[1px] bg-slate-200/50 border-dashed border-b"></div>
              <div className="absolute left-16 md:left-20 right-0 top-3/4 h-[1px] bg-slate-100/50"></div>
              
              <div className="absolute left-0 w-16 md:w-20 h-full flex flex-col justify-evenly items-end pr-2 py-4 pointer-events-none opacity-40">
                 <span className="text-[8px] font-mono text-slate-400">15</span>
                 <span className="text-[8px] font-mono text-slate-400">30</span>
                 <span className="text-[8px] font-mono text-slate-400">45</span>
              </div>
`;

content = content.replace(/              <span className="w-16 md:w-20 text-\[11px\] font-mono text-slate-400 font-bold pt-2 text-center shrink-0">\{hour\}:00<\/span>/, replacement);

fs.writeFileSync('src/components/DashboardCalendar.tsx', content);
