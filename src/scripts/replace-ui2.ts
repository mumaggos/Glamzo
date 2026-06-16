import fs from 'fs';
import path from 'path';

let content = fs.readFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), 'utf8');

// Reservas list action buttons replacement
content = content.replace(/{bk\.booking_status !== 'completed' && bk\.booking_status !== 'cancelled' \? \([\s\S]*?\) : \(\s*<span className="text-\[10px\] (?:text-slate-\d+ )*text-slate-500 font-mono">-<\/span>\s*\)}/g, 
`{(() => {
  const isPast = isPastBooking(bk.booking_date, bk.end_time || bk.start_time);
  return bk.booking_status !== 'completed' && bk.booking_status !== 'cancelled' && bk.booking_status !== 'no_show' ? (
    <>
      {!isPast ? (
        <>
          <button 
            onClick={() => handleUpdateBookingStatus(bk.id, 'completed')}
            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] font-mono rounded-lg uppercase transition-all cursor-pointer inline-block mx-0.5"
          >
            Concluir
          </button>
          <button 
            onClick={() => handleUpdateBookingStatus(bk.id, 'cancelled')}
            className="px-2 py-1 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors text-[9px] font-mono rounded-lg uppercase cursor-pointer inline-block mx-0.5"
          >
            Mover / Malsucedido
          </button>
        </>
      ) : (
        <button 
          onClick={() => handleUpdateBookingStatus(bk.id, 'no_show')}
          className="px-2 py-1 bg-rose-50 border border-rose-200 text-rose-500 hover:bg-rose-100 transition-colors text-[9px] font-mono rounded-lg uppercase cursor-pointer inline-block mx-0.5"
        >
          Reclamar (Falta)
        </button>
      )}
    </>
  ) : (
    <span className="text-[10px] text-slate-500 font-mono">-</span>
  );
})()}`);

fs.writeFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), content);
console.log('Done fix 2');
