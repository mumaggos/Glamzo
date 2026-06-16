import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function SecurityBadge({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-50/80 border border-emerald-100/50 rounded-lg text-emerald-700 w-fit ${className}`}>
      <ShieldCheck className="w-3.5 h-3.5" />
      <span className="text-[10px] font-extrabold uppercase tracking-wider font-mono">Pagamento 100% Seguro</span>
    </div>
  );
}
