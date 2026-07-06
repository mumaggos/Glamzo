import React from "react";
import { useOutletContext } from "react-router-dom";
import { Business } from "../../../types";

interface PartnerContextType {
  business: Business | null;
}

export default function StoreAssetsTab() {
  const { business } = useOutletContext<PartnerContextType>();

  return (
    <div className="animate-fade-in w-full max-w-7xl mx-auto space-y-6 text-slate-700">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-extrabold mb-4">Website & QR Code</h2>
        <p className="text-sm text-slate-500">
          Gere a aparência pública do teu salão, links sociais e descarrega o teu QR Code.
        </p>
      </div>
    </div>
  );
}
