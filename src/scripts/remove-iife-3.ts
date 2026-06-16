import fs from 'fs';
import path from 'path';

let content = fs.readFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), 'utf8');

// The problematic IIFEs are generated in my very first attempt and remove-iife.ts

// First let's remove any arrow function wrappers that might trick Fast Refresh
content = content.replace(/\{\(\(effectiveStatus\) => \([\s\S]*?\}\s*<\/span>\s*\)\)\(\(\(bk\.booking_status === 'confirmed' \|\| bk\.booking_status === 'pending'\) && isPastBooking\(bk\.booking_date, bk\.end_time \|\| bk\.start_time\)\) \? 'completed' : bk\.booking_status\)\}/g,
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

// also the invoice overlay IIFE!
// Wait! I have `{selectedInvoice && (() => { const invoiceRef="..."; return ... })()}`
// Fast Refresh injects hooks into invoice overlay IIFE too !!
content = content.replace(/\{selectedInvoice && \(\(\) => \{([\s\S]*?)\}\)\(\)\}/, 
`{selectedInvoice && (
  <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-slate-100 text-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col border border-slate-200 text-left">
      ... Wait, I need to properly keep the body...
`); // actually let me just use a function match
fs.writeFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), content);
