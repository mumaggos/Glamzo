import React, { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Users, Search, Star, Clock, X, Phone, Mail, User, CalendarDays, Banknote } from "lucide-react";
import { Business, Booking } from "../../../types";

interface PartnerContextType {
  business: Business | null;
  bookings: Booking[];
  loadLayoutData: () => Promise<void>;
}

const ClientRow = React.memo(({ client, onOpenProfile }: { client: any, onOpenProfile: (c: any) => void }) => {
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
            {client.email || "Sem e-mail"}
          </div>
        </div>
      </td>
      <td className="py-4 px-6 font-bold text-slate-700 text-center">{client.visits}</td>
      <td className="py-4 px-6 font-bold text-slate-700 text-right">{client.spent.toFixed(2)}€</td>
      <td className="py-4 px-6 text-right">
        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-mono text-[10px] font-bold">
          {client.lastVisit}
        </span>
      </td>
      <td className="py-4 px-6 text-right">
         <button onClick={() => onOpenProfile(client)} className="text-[10px] font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors">
           Ver Perfil
         </button>
      </td>
    </tr>
  );
});

const ClientsTab = React.memo(function ClientsTab() {
  const { bookings } = useOutletContext<PartnerContextType>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<any | null>(null);

  const uniqueClientsMap = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        email: string;
        phone: string;
        visits: number;
        spent: number;
        lastVisit: string;
      }
    >();

    bookings.forEach((bk: any) => {
      if (bk.booking_status !== "completed") return;
      const custId = bk.customer_id || "GUEST";
      const spentAmount = Number(bk.total_price) || 0;
      let lastV = bk.booking_date;

      if (!map.has(custId)) {
        const fullName = bk.customer?.full_name || bk.customer_profile?.full_name || bk.customer?.email || bk.customer_profile?.email || "Cliente Sem Nome";
        const email = bk.customer?.email || bk.customer_profile?.email || "";
        const phone = bk.customer?.phone || bk.customer_profile?.phone || "Não fornecido";

        map.set(custId, {
          id: custId,
          name: fullName,
          email: email,
          phone: phone,
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
          <div className="overflow-x-auto w-full block sm:table">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                <tr>
                  <th className="py-4.5 px-6">Cliente</th>
                  <th className="py-4.5 px-4 text-center">Nº Visitas</th>
                  <th className="py-4.5 px-4 text-right">Faturação Total</th>
                  <th className="py-4.5 px-6 text-right">Última Visita</th>
                  <th className="py-4.5 px-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs bg-white">
                {clientsList.map((client) => (
                  <ClientRow key={client.id} client={client} onOpenProfile={setSelectedClient} />
                ))}
                {clientsList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedClient && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedClient(null)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" /> Perfil do Cliente
              </h2>
              <button onClick={() => setSelectedClient(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-purple-50 border-2 border-purple-100 text-purple-600 flex items-center justify-center font-display font-extrabold text-2xl shrink-0">
                  {selectedClient.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{selectedClient.name}</h3>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 mt-1">
                    <Mail className="w-3.5 h-3.5" /> {selectedClient.email || "Sem e-mail"}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Telefone</span>
                    <span className="block text-sm font-bold text-slate-700">{selectedClient.phone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 text-purple-600 mb-2">
                      <CalendarDays className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Reservas</span>
                    </div>
                    <span className="block text-2xl font-black text-purple-900">{selectedClient.visits}</span>
                  </div>
                  
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                      <Banknote className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Gasto Total</span>
                    </div>
                    <span className="block text-2xl font-black text-emerald-900">{selectedClient.spent.toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default ClientsTab;
