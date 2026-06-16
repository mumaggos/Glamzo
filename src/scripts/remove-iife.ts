import fs from 'fs';
import path from 'path';

let content = fs.readFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), 'utf8');

// The problematic IIFEs are:

// 1. Agenda action buttons
content = content.replace(/\{\(\(\) => \{\s*const isPast = isPastBooking\(bk\.booking_date, bk\.end_time \|\| bk\.start_time\);\s*return bk\.booking_status !== 'completed' && bk\.booking_status !== 'cancelled' && bk\.booking_status !== 'no_show' && \([\s\S]*?<\/div>\s*\);\}\)\(\)\}/g,
`{bk.booking_status !== 'completed' && bk.booking_status !== 'cancelled' && bk.booking_status !== 'no_show' && (
  <div className="flex items-center gap-1.5">
    {!isPastBooking(bk.booking_date, bk.end_time || bk.start_time) ? (
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
)}`);


// 2. Agenda status badge
content = content.replace(/\{\(\(\) => \{\s*const isPast = isPastBooking\(bk\.booking_date, bk\.end_time \|\| bk\.start_time\);\s*const effectiveStatus = \(bk\.booking_status === 'confirmed' \|\| bk\.booking_status === 'pending'\) && isPast \? 'completed' : bk\.booking_status;\s*return \(\s*<span className=\{\`px-2\.5 py-1 rounded-full text-\[9px\] font-extrabold font-mono uppercase tracking-wider \$\{\s*effectiveStatus === 'completed'[\s\S]*?'bg-indigo-50 text-indigo-400 border border-indigo-200'\s*\}\`\}>\s*\{effectiveStatus === 'completed' \? 'concluída' : effectiveStatus === 'no_show' \? 'Falta de Comparência' : effectiveStatus\}\s*<\/span>\s*\);\s*\}\)\(\)\}/g,
`{((effectiveStatus) => (
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
))(((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status)}`);

// 3. Reservas status badge
content = content.replace(/\{\(\(\) => \{\s*const isPast = isPastBooking\(bk\.booking_date, bk\.end_time \|\| bk\.start_time\);\s*const effectiveStatus = \(bk\.booking_status === 'confirmed' \|\| bk\.booking_status === 'pending'\) && isPast \? 'completed' : bk\.booking_status;\s*return \(\s*<span className=\{\`inline-block px-2\.5 py-0\.5 border rounded-full text-\[9px\] font-bold font-mono uppercase \$\{\s*effectiveStatus === 'confirmed'[\s\S]*?'bg-amber-50 border-amber-200 text-amber-500'\s*\}\`\}>\s*\{effectiveStatus === 'no_show' \? 'Falta' : effectiveStatus === 'confirmed' \? 'Confirmado' : effectiveStatus === 'completed' \? 'Concluído' : effectiveStatus\}\s*<\/span>\s*\);\s*\}\)\(\)\}/g,
`{((effectiveStatus) => (
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
))(((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status)}`);

// 4. Reservas action buttons
content = content.replace(/\{\(\(\) => \{\s*const isPast = isPastBooking\(bk\.booking_date, bk\.end_time \|\| bk\.start_time\);\s*return bk\.booking_status !== 'completed' && bk\.booking_status !== 'cancelled' && bk\.booking_status !== 'no_show' \? \([\s\S]*?\) : \(\s*<span className="text-\[10px\] text-slate-500 font-mono">-<\/span>\s*\);\s*\}\)\(\)\}/g,
`{bk.booking_status !== 'completed' && bk.booking_status !== 'cancelled' && bk.booking_status !== 'no_show' ? (
  <>
    {!isPastBooking(bk.booking_date, bk.end_time || bk.start_time) ? (
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
)}`);


fs.writeFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), content);
console.log('Done refactoring IIFEs to standard JSX');
