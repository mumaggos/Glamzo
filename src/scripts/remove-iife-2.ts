import fs from 'fs';
import path from 'path';

let content = fs.readFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), 'utf8');

content = content.replace(/\{\(\(\) => \{\s*const effStat = [\s\S]*?<\/span>;\s*\}\)\(\)\}/g,
(match) => {
  if (match.includes("bg-indigo-50")) {
      return `<span className={"px-2.5 py-1 rounded-full text-[9px] font-extrabold font-mono uppercase tracking-wider " + (
        (((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status) === 'completed' ? 'bg-slate-50 text-slate-500 border border-slate-200' :
        (((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status) === 'cancelled' ? 'bg-rose-50 text-rose-400 border border-rose-200' :
        (((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status) === 'no_show' ? 'bg-orange-50 text-orange-500 border border-orange-200' : 'bg-indigo-50 text-indigo-400 border border-indigo-200'
      )}>
        {(((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status) === 'completed' ? 'concluída' :
         (((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status) === 'no_show' ? 'Falta de Comparência' : 
         (((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status)}
      </span>`;
  } else {
      return `<span className={"inline-block px-2.5 py-0.5 border rounded-full text-[9px] font-bold font-mono uppercase " + (
        (((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status) === 'confirmed' ? 'bg-rose-50 text-rose-500 border-rose-200' :
        (((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status) === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
        (((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status) === 'cancelled' ? 'bg-white border-slate-200 text-slate-500' :
        (((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status) === 'no_show' ? 'bg-orange-50 border-orange-200 text-orange-500' : 'bg-amber-50 border-amber-200 text-amber-500'
      )}>
        {(((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status) === 'no_show' ? 'Falta' :
         (((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status) === 'confirmed' ? 'Confirmado' :
         (((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status) === 'completed' ? 'Concluído' :
         (((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status)}
      </span>`;
  }
});

fs.writeFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), content);
console.log('Fixed IIFEs inline');
