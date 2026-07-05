const fs = require('fs');

const content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
const lines = content.split('\n');

const startIndex = lines.findIndex(line => line.includes('{activeTab === "agenda" && ('));
const endIndex = lines.findIndex(line => line.includes('{activeTab === "reservas" && ('));

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `              {activeTab === "agenda" && (
                <div id="view-agenda" className="space-y-6 text-left animate-fade-in text-slate-700">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-200 pb-5">
                    <div>
                      <h3 className="text-xl font-display font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <span>Agenda do Salão</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Visualize, filtre e controle todas as marcações em tempo real de forma profissional.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => {
                          setManualBookingType("booking");
                          setIsManualBookingOpen(true);
                          if (services.length > 0) setManualServiceId(services[0].id);
                          if (staff.length > 0) setManualStaffId(staff[0].id);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition shadow-lg shadow-purple-900/30"
                      >
                        <Calendar className="w-4 h-4 text-white" />
                        <span>Nova Reserva</span>
                      </button>
                    </div>
                  </div>
                  
                  <DashboardCalendar 
                    bookings={bookings}
                    services={services}
                    staff={staff}
                    onEventClick={(info) => {
                      const booking = info.event.extendedProps.booking;
                      setSelectedBooking(booking);
                      setIsViewBookingModalOpen(true);
                    }}
                    onEventDrop={async (info) => {
                      const event = info.event;
                      const booking = event.extendedProps.booking;
                      const newDate = event.start.toISOString().split('T')[0];
                      const newStartTime = event.start.toTimeString().split(' ')[0].substring(0, 5);
                      
                      let endStr = event.end ? event.end.toTimeString().split(' ')[0].substring(0, 5) : booking.end_time;
                      
                      setLoading(true);
                      const { error } = await supabase.from('bookings').update({
                        booking_date: newDate,
                        start_time: newStartTime,
                        end_time: endStr
                      }).eq('id', booking.id);
                      
                      if (error) {
                        setGlobalError("Erro ao mover a marcação.");
                        info.revert();
                      } else {
                        setGlobalSuccess("Marcação atualizada com sucesso.");
                        loadTerminalData();
                      }
                      setLoading(false);
                    }}
                    onDateSelect={(info) => {
                      const start = info.start;
                      const date = start.toISOString().split('T')[0];
                      const time = start.toTimeString().split(' ')[0].substring(0, 5);
                      
                      setSelectedAgendaDate(date);
                      setManualBookingType("booking");
                      setIsManualBookingOpen(true);
                      // Pre-fill time/date logic can be added here if states allow
                    }}
                  />
                </div>
              )}
`;

  lines.splice(startIndex, endIndex - startIndex, replacement);
  fs.writeFileSync('src/pages/Dashboard.tsx', lines.join('\n'));
  console.log("Successfully replaced agenda view.");
} else {
  console.log("Could not find boundaries.");
}
