import React from "react";
import { useOutletContext } from "react-router-dom";
import DashboardMessages from "../../../components/DashboardMessages";
import { Business } from "../../../types";

interface PartnerContextType {
  business: Business | null;
}

export default function MessagesTab() {
  const { business } = useOutletContext<PartnerContextType>();

  if (!business) return null;

  return (
    <div className="animate-fade-in w-full max-w-[1600px] mx-auto text-slate-700 h-[calc(100vh-140px)] flex flex-col py-6">
      <div className="flex-1 w-full relative">
        <DashboardMessages businessId={business.id} />
      </div>
    </div>
  );
}
