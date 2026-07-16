const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf8');

code = code.replace(
  /\} catch \(err\) \{\s*alert\("Erro ao atualizar o estado\."\);\s*console\.error\(err\);\s*\}/,
  `} catch (err: any) {
      toast.error(err.message || "Erro ao atualizar o estado.");
      console.error(err);
    }`
);

code = code.replace(
  /\{\s*selectedBooking\.booking_status === "completed" \? \(/,
  `{selectedBooking.booking_status === "pending" && (
                       <button onClick={() => handleUpdateBookingStatus("confirmed")} disabled={isUpdatingBooking} className="w-full bg-blue-500 hover:bg-blue-600 transition-colors text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 mb-2"><CheckCircle className="w-5 h-5" /> Confirmar Marcação</button>
                     )}
                     {selectedBooking.booking_status === "completed" ? (`
);

fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', code);
