import fs from 'fs';
import path from 'path';

let content = fs.readFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), 'utf8');

// Update Agenda & Reservas view using regex
// Since rewriting exact blocks might be tricky due to nesting, let's use exact string replacement for specific blocks if possible.

// But wait, it's safer to use a function map inside the replacements.
content = content.replace(/{bk\.booking_status !== 'completed' && bk\.booking_status !== 'cancelled' && \(\s*<div className="flex items-center gap-1\.5">[\s\S]*?<\/div>\s*\)}/g, 
`{(() => {
  const isPast = isPastBooking(bk.booking_date, bk.end_time || bk.start_time);
  return bk.booking_status !== 'completed' && bk.booking_status !== 'cancelled' && bk.booking_status !== 'no_show' && (
  <div className="flex items-center gap-1.5">
    {!isPast ? (
      <>
        <button 
          type="button"
          onClick={() => handleUpdateBookingStatus(bk.id, 'completed')}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-[10px] font-mono cursor-pointer uppercase tracking-wider transition-all"
        >
          Concluir
        </button>
        <button 
          type="button"
          onClick={() => handleUpdateBookingStatus(bk.id, 'cancelled')}
          className="px-3.5 py-2 bg-white hover:bg-rose-50 border border-slate-200 text-slate-500 hover:text-rose-400 rounded-xl text-[10px] font-mono cursor-pointer transition-all"
        >
          Mover/Cancelar
        </button>
      </>
    ) : (
      <button 
        type="button"
        onClick={() => handleUpdateBookingStatus(bk.id, 'no_show')}
        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-200 rounded-xl text-[10px] font-extrabold font-mono cursor-pointer uppercase tracking-wider transition-all"
      >
        Reclamar: Falta de Comparência
      </button>
    )}
  </div>
);})()}`);


// Agenda status badge replacement
content = content.replace(/<span className={`px-2\.5 py-1 rounded-full text-\[9px\] font-extrabold font-mono uppercase tracking-wider \${\s*bk\.booking_status === 'completed'[\s\S]*?`}>\s*\{bk\.booking_status === 'completed' \? 'concluída' : bk\.booking_status\}\s*<\/span>/, 
`{(() => {
  const isPast = isPastBooking(bk.booking_date, bk.end_time || bk.start_time);
  const effectiveStatus = (bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPast ? 'completed' : bk.booking_status;
  return (
    <span className={\`px-2.5 py-1 rounded-full text-[9px] font-extrabold font-mono uppercase tracking-wider \${
      effectiveStatus === 'completed' 
        ? 'bg-slate-50 text-slate-500 border border-slate-200' 
        : effectiveStatus === 'cancelled'
        ? 'bg-rose-50 text-rose-400 border border-rose-200'
        : effectiveStatus === 'no_show'
        ? 'bg-orange-50 text-orange-500 border border-orange-200'
        : 'bg-indigo-50 text-indigo-400 border border-indigo-200'
    }\`}>
      {effectiveStatus === 'completed' ? 'concluída' : effectiveStatus === 'no_show' ? 'Falta de Comparência' : effectiveStatus}
    </span>
  );
})()}`);


// Reservas list status badge replacement
// <span className={`inline-block px-2.5 py-0.5 border rounded-full text-[9px] font-bold font-mono uppercase ${ ... }`}>{bk.booking_status === 'no_show' ? 'Falta' : bk.booking_status === 'confirmed' ? 'Confirmado' : bk.booking_status}</span>
content = content.replace(/<span className={`inline-block px-2\.5 py-0\.5 border rounded-full text-\[9px\] font-bold font-mono uppercase \${\s*bk\.booking_status === 'confirmed'[\s\S]*?`}>\s*\{bk\.booking_status === 'no_show' \? 'Falta' : bk\.booking_status === 'confirmed' \? 'Confirmado' : bk\.booking_status\}\s*<\/span>/, 
`{(() => {
  const isPast = isPastBooking(bk.booking_date, bk.end_time || bk.start_time);
  const effectiveStatus = (bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPast ? 'completed' : bk.booking_status;
  return (
    <span className={\`inline-block px-2.5 py-0.5 border rounded-full text-[9px] font-bold font-mono uppercase \${
      effectiveStatus === 'confirmed'
        ? 'bg-rose-50 text-rose-500 border-rose-200'
        : effectiveStatus === 'completed'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
        : effectiveStatus === 'cancelled'
        ? 'bg-white border-slate-200 text-slate-500'
        : effectiveStatus === 'no_show'
        ? 'bg-orange-50 border-orange-200 text-orange-500'
        : 'bg-amber-50 border-amber-200 text-amber-500'
    }\`}>
      {effectiveStatus === 'no_show' ? 'Falta' : effectiveStatus === 'confirmed' ? 'Confirmado' : effectiveStatus === 'completed' ? 'Concluído' : effectiveStatus}
    </span>
  );
})()}`);

// Reservas list action buttons replacement
content = content.replace(/{bk\.booking_status !== 'completed' && bk\.booking_status !== 'cancelled' \? \([\s\S]*?\) : \(\s*<span className="text-\[10px\] text-slate-500 font-mono">-<\/span>\s*\)}/g, 
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
            Malsucedido
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


// Overview check-in list action button
// Fazer checkin
content = content.replace(/{bookings\.filter\(b => b\.booking_status !== 'completed' && b\.booking_status !== 'cancelled'\)\.length > 0 \? \(\s*bookings[\s\S]*?\.filter\(b => b\.booking_status !== 'completed' && b\.booking_status !== 'cancelled'\)[\s\S]*?\.slice\(0, 3\)[\s\S]*?\}\s*className="px-3 py-1\.5 bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-black text-\[10px\] uppercase font-mono tracking-wider rounded-lg transition cursor-pointer"\s*>\s*Fazer Check-in\s*<\/button>\s*<\/div>\s*\)\)\s*\) : \(/,
`{bookings.filter(b => b.booking_status !== 'completed' && b.booking_status !== 'cancelled' && b.booking_status !== 'no_show' && !isPastBooking(b.booking_date, b.end_time || b.start_time)).length > 0 ? (
  bookings
    .filter(b => b.booking_status !== 'completed' && b.booking_status !== 'cancelled' && b.booking_status !== 'no_show' && !isPastBooking(b.booking_date, b.end_time || b.start_time))
    .slice(0, 3)
    .map(bk => (
      <div key={bk.id} className="p-3 bg-white rounded-2xl border border-slate-100 flex items-center justify-between text-xs transition">
        <div className="space-y-0.5">
          <div className="font-extrabold text-slate-900 text-[12px]">
            {bk.customer?.full_name || bk.customer_profile?.full_name || 'Particular'}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <span>⏱ {bk.start_time}</span>
            <span>•</span>
            <span>💈 {bk.service?.name}</span>
          </div>
        </div>

        <button
          onClick={async () => {
            playTerminalChime();
            await handleUpdateBookingStatus(bk.id, 'completed');
            notifyTerminal("✅ Check-in Efetuado", \`O cliente \${bk.customer?.full_name || 'Particular'} deu entrada física no salão!\`);
          }}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase font-mono tracking-wider rounded-lg transition cursor-pointer"
        >
          Fazer Check-in
        </button>
      </div>
    ))
) : (`);

fs.writeFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), content);
console.log('Done replacement');
