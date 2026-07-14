sed -i '245,268c\
                              {(() => {\
                 const bookingDate = new Date(selectedBooking.booking_date);\
                 const isFullyCompleted = (selectedBooking.client_completed && selectedBooking.business_completed) || (selectedBooking.business_completed && (new Date().getTime() - bookingDate.getTime()) > 48 * 60 * 60 * 1000);\
                 return (\
                   <>\
                     {selectedBooking.booking_status === "completed" ? (\
                       <div className="space-y-2">\
                         <div className="w-full bg-gradient-to-r from-emerald-500 to-purple-500 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-not-allowed opacity-90">\
                           <CheckCircle className="w-5 h-5" /> Serviço Concluído\
                         </div>\
                         {!selectedBooking.business_completed && !isFullyCompleted && (\
                           <button onClick={handleBusinessCompleteBooking} disabled={isUpdatingBooking} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">Dupla Confirmação (Concluir Reserva)</button>\
                         )}\
                         {!isFullyCompleted && (\
                           <button onClick={handleOpenDispute} className="w-full bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold py-3 border border-rose-200 rounded-xl flex items-center justify-center gap-2 transition-colors">Abrir Disputa / Problema</button>\
                         )}\
                       </div>\
                     ) : (\
                       <button onClick={() => handleUpdateBookingStatus("completed")} disabled={isUpdatingBooking} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-[1.02] transition-transform text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> Confirmar Conclusão</button>\
                     )}\
                     {selectedBooking.booking_status !== "completed" && selectedBooking.booking_status !== "cancelled" && (\
                       <button onClick={() => handleUpdateBookingStatus("cancelled")} disabled={isUpdatingBooking} className="w-full bg-white text-rose-500 hover:bg-rose-50 font-bold py-3 border rounded-xl flex items-center justify-center gap-2 transition-colors mt-2">Cancelar Marcação</button>\
                     )}\
                   </>\
                 );\
               })()}' src/pages/partner/tabs/AgendaTab.tsx
