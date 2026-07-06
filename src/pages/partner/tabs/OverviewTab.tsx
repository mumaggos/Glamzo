import React, { useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { DashboardOverview } from "../../../components/DashboardOverview";
import { Business, Booking, Staff, Service } from "../../../types";
import { Sparkles, Trophy } from "lucide-react";

interface PartnerContextType {
  business: Business | null;
  user: any;
  profile: any;
  tabletOrder: any;
  bookings: Booking[];
  services: Service[];
  staff: Staff[];
}

export default function OverviewTab() {
  const { business, bookings, services, staff } = useOutletContext<PartnerContextType>();
  const navigate = useNavigate();

  // Rotas corrigidas para a navegação interna da app
  const handleSetActiveTab = (tab: string) => {
    const routeMap: Record<string, string> = {
      'agenda': '/partner/dashboard/agenda',
      'clientes': '/partner/dashboard/clientes',
      'servicos': '/partner/dashboard/servicos',
      'equipa': '/partner/dashboard/equipa',
      'horario': '/partner/dashboard/horarios',
      'financas': '/partner/dashboard/financeiro',
      'reservas': '/partner/dashboard/reservas',
    };
    if (routeMap[tab]) {
      navigate(routeMap[tab]);
    }
  };

  const topService = useMemo(() => {
    if (!bookings || bookings.length === 0) return null;
    
    const serviceRevenue: Record<string, number> = {};
    bookings.forEach(b => {
      if (b.booking_status !== 'cancelled' && b.service) {
        const serviceName = b.service.name;
        serviceRevenue[serviceName] = (serviceRevenue[serviceName] || 0) + (b.total_price || 0);
      }
    });

    let bestService = null;
    let maxRevenue = -1;

    for (const [name, revenue] of Object.entries(serviceRevenue)) {
      if (revenue > maxRevenue) {
        maxRevenue = revenue;
        bestService = name;
      }
    }

    return bestService;
  }, [bookings]);

  return (
    <div className="animate-fade-in w-full max-w-[1600px] mx-auto space-y-6 text-slate-700"> 
        
       <DashboardOverview 
         business={business}
         bookings={bookings || []}
         services={services || []}
         staff={staff || []}
         resolvedSubscriptionStatus="active"
         trialDaysRemaining={14}
         setActiveTab={handleSetActiveTab}
       />

       {/* Insight de Elite Card */}
       {topService && (
         <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 sm:p-8 rounded-3xl shadow-xl border border-indigo-800/50 flex flex-col sm:flex-row items-center gap-6 text-white relative overflow-hidden">
           {/* Decorational element */}
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full"></div>
           <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full"></div>

           <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 backdrop-blur-md z-10">
             <Trophy className="w-8 h-8 text-yellow-400" />
           </div>
           
           <div className="z-10 text-center sm:text-left">
             <h3 className="text-xl font-extrabold tracking-tight text-white mb-1 flex items-center justify-center sm:justify-start gap-2">
               Insight de Elite <Sparkles className="w-4 h-4 text-purple-300" />
             </h3>
             <p className="text-indigo-200 text-sm font-medium">
               O teu serviço estrela é <strong className="text-white text-base">"{topService}"</strong> – parabéns! Mantém o excelente trabalho para continuares a faturar.
             </p>
           </div>
         </div>
       )}
    </div>
  );
}
