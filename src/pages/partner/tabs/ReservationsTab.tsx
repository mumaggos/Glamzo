import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { Booking, BookingStatus } from "../../../types";
import { Search } from "lucide-react";

export function ReservationsTab() {
  const { bookings, loadLayoutData } = useOutletContext<any>();
  const [bookingFilter, setBookingFilter] = useState<
    "all" | "pending" | "confirmed" | "completed" | "cancelled" | "no_show"
  >("all");
  const [bookingSearch, setBookingSearch] = useState("");

  const handleUpdateBookingStatus = async (
    id: string,
    newStatus: BookingStatus,
  ) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ booking_status: newStatus })
        .eq("id", id);
      if (error) {
        console.error("Error updating booking status", error);
        return false;
      }
      await loadLayoutData();
      return true;
    } catch {
      return false;
    }
  };

  const filteredBookings = bookings
    ?.filter((b: any) => {
      const matchesSearch =
        b.customer_name?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.service_name?.toLowerCase().includes(bookingSearch.toLowerCase());
      if (bookingFilter === "all") return matchesSearch;
      return b.booking_status === bookingFilter && matchesSearch;
    })
    .sort((a: any, b: any) => {
      const dateA = new Date(`${a.booking_date}T${a.start_time}`);
      const dateB = new Date(`${b.booking_date}T${b.start_time}`);
      return dateB.getTime() - dateA.getTime();
    });

  return (
    <div id="view-reservas" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
            Gestão das Marcações
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Consulte e gira todos os agendamentos feitos pelos seus clientes e equipa num único ecrã.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-50/40 p-5 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-550 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={bookingSearch}
            onChange={(e) => setBookingSearch(e.target.value)}
            placeholder="Pesquise por cliente ou serviço..."
            className="w-full bg-white border border-slate-200 text-sm pl-10 pr-4 py-2.5 rounded-xl text-slate-900 placeholder-slate-600 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-550 focus:ring-rose-600/25"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto">
          {[
            { id: "all", label: "Todas" },
            { id: "pending", label: "Pendentes" },
            { id: "confirmed", label: "Confirmadas" },
            { id: "completed", label: "Concluídas" },
            { id: "no_show", label: "Faltas" },
            { id: "cancelled", label: "Canceladas" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setBookingFilter(item.id as any)}
              className={`px-4 py-2 rounded-xl text-[11px] font-bold tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer ${
                bookingFilter === item.id
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        {filteredBookings?.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Nenhuma marcação encontrada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    Data/Hora
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    Cliente
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    Serviço
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    Preço
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    Status
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">
                    Ações Rápidas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredBookings?.map((bk: any) => (
                  <tr key={bk.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono text-xs text-slate-600 whitespace-nowrap">
                      <div className="font-bold text-slate-900">
                        {new Date(bk.booking_date).toLocaleDateString("pt-PT")}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {bk.start_time.substring(0, 5)} -{" "}
                        {bk.end_time?.substring(0, 5) || "--:--"}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-900">
                      {bk.customer_name}
                      {bk.customer_email && (
                        <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                          {bk.customer_email}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-slate-600">
                      {bk.service_name}
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        com {bk.staff_name}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs font-bold text-slate-900">
                      {bk.total_price}€
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                          bk.booking_status === "completed"
                            ? "bg-emerald-50 text-emerald-600"
                            : bk.booking_status === "confirmed"
                              ? "bg-blue-50 text-blue-600"
                              : bk.booking_status === "pending"
                                ? "bg-amber-50 text-amber-600"
                                : bk.booking_status === "cancelled"
                                  ? "bg-slate-100 text-slate-500"
                                  : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {bk.booking_status === "completed"
                          ? "Concluído"
                          : bk.booking_status === "confirmed"
                            ? "Confirmado"
                            : bk.booking_status === "pending"
                              ? "Pendente"
                              : bk.booking_status === "cancelled"
                                ? "Cancelado"
                                : "Falta"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {bk.booking_status === "pending" ? (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateBookingStatus(bk.id, "confirmed")
                            }
                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[9px] font-mono rounded-lg uppercase transition-all cursor-pointer inline-block mx-0.5"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateBookingStatus(bk.id, "cancelled")
                            }
                            className="px-2 py-1 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors text-[9px] font-mono rounded-lg uppercase cursor-pointer inline-block mx-0.5"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : bk.booking_status === "confirmed" ? (
                        new Date().toISOString().split("T")[0] >=
                          bk.booking_date &&
                        new Date().toTimeString().substring(0, 5) >=
                          (bk.end_time || bk.start_time) ? (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateBookingStatus(bk.id, "completed")
                              }
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] font-mono rounded-lg uppercase transition-all cursor-pointer inline-block mx-0.5"
                            >
                              Concluir
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateBookingStatus(bk.id, "cancelled")
                              }
                              className="px-2 py-1 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors text-[9px] font-mono rounded-lg uppercase cursor-pointer inline-block mx-0.5"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() =>
                              handleUpdateBookingStatus(bk.id, "no_show")
                            }
                            className="px-2 py-1 bg-rose-50 border border-rose-200 text-rose-500 hover:bg-rose-100 transition-colors text-[9px] font-mono rounded-lg uppercase cursor-pointer inline-block mx-0.5"
                          >
                            Falta (No-Show)
                          </button>
                        )
                      ) : (
                        <span className="text-[10px] text-slate-300 font-mono italic">
                          Fechado
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
