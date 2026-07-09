import React, { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Users, Search, Star, Clock } from "lucide-react";
import { Business, Booking } from "../../../types";

interface PartnerContextType {
  business: Business | null;
  bookings: Booking[];
  loadLayoutData: () => Promise<void>;
}


const ClientRow = React.memo(({ client }: { client: any }) => {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="py-4 px-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center font-mono font-bold text-[10px]">
          {client.name.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="font-extrabold text-slate-900">
            {client.name}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            {client.email}
          </div>
        </div>
      </td>
      <td className="py-4 px-6 font-bold text-slate-700">{client.visits}</td>
      <td className="py-4 px-6 font-bold text-slate-700">{client.spent.toFixed(2)}€</td>
      <td className="py-4 px-6">
        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-mono text-[10px] font-bold">
          {client.lastVisit}
        </span>
      </td>
      <td className="py-4 px-6 text-right">
         <button className="text-[10px] font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors">Ver Perfil</button>
      </td>
    </tr>
  );

});
const ClientsTab = React.memo(function ClientsTab() {
  const { bookings } = useOutletContext<PartnerContextType>();
  const [searchTerm, setSearchTerm] = useState("");

  const uniqueClientsMap = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        email: string;
        visits: number;
        spent: number;
        lastVisit: string;
      }
    >();

    bookings.forEach((bk) => {
      if (bk.booking_status === "cancelled") return;

      const custId = bk.customer_id || "GUEST";
      const spentAmount = Number(bk.total_price) || 0;
      let lastV = bk.booking_date;

      if (!map.has(custId)) {
        map.set(custId, {
          id: custId,
          name:
            (bk as any).customer?.full_name ||
            bk.customer_profile?.full_name ||
            "Cliente Particular",
          email: (bk as any).customer?.email || bk.customer_profile?.email || "N/A",
          visits: 1,
          spent: spentAmount,
          lastVisit: lastV,
        });
      } else {
        const prev = map.get(custId)!;
        map.set(custId, {
          ...prev,
          visits: prev.visits + 1,
          spent: prev.spent + spentAmount,
          lastVisit: prev.lastVisit > lastV ? prev.lastVisit : lastV,
        });
      }
    });
    return map;
  }, [bookings]);

  const clientsList = useMemo(() => {
    return Array.from(uniqueClientsMap.values())
      .filter((c: any) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          c.name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term)
        );
      })
      .sort((a: any, b: any) => b.lastVisit.localeCompare(a.lastVisit));
  }, [uniqueClientsMap, searchTerm]);

  const totalSpent = useMemo(() => {
    let sum = 0;
    uniqueClientsMap.forEach((c) => {
      sum += c.spent;
    });
    return sum;
  }, [uniqueClientsMap]);

  const averageTicket = uniqueClientsMap.size > 0 ? (totalSpent / uniqueClientsMap.size).toFixed(2) : "0.00";

  return (
    <div className="space-y-6 max-w-[1600px] w-full mx-auto animate-fade-in text-slate-700">
      <div className="border-b border-slate-100 pb-5">
        <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
          Livro de Clientes Registados
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Histórico automático de visitas e gastos individuais de cada pessoa atendida.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
              Total Clientes
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1.5 block">
              {uniqueClientsMap.size}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white text-slate-500 flex items-center justify-center border border-slate-200">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
              Ticket Médio Global
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1.5 block">
              {averageTicket}
              <span className="text-sm font-bold text-slate-400 ml-1">€</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white text-slate-500 flex items-center justify-center border border-slate-200">
            <Star className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
              Atendimentos Realizados
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1.5 block">
              {bookings.filter((b) => b.booking_status === "completed").length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white text-slate-500 flex items-center justify-center border border-slate-200">
            <Clock className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-sm pl-10 pr-4 py-2.5 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/25"
            />
          </div>
        </div>
        
        <div className="w-full max-w-[100vw] md:max-w-full overflow-x-auto custom-scrollbar pb-2">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
              <tr>
                <th className="py-4.5 px-6">Cliente</th>
                <th className="py-4.5 px-4 text-center">Nº Visitas</th>
                <th className="py-4.5 px-4 text-right">Faturação Total</th>
                <th className="py-4.5 px-6 text-right">Última Visita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs bg-white">
              {clientsList.map((client) => (
                <ClientRow key={client.id} client={client} />
              ))}
              {clientsList.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});
export default ClientsTab;
