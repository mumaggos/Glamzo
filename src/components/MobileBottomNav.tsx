import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Compass, Search, Heart, User, Home } from 'lucide-react';

export default function MobileBottomNav() {
  const location = useLocation();

  // Esconder no painel de parceiro, setup, login, etc.
  const hiddenRoutes = ['/partner', '/admin', '/login', '/signup', '/staff', '/setup'];
  const shouldHide = hiddenRoutes.some(route => location.pathname.startsWith(route));

  if (shouldHide) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200/50 z-50 px-6 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] flex justify-between items-center shadow-[0_-10px_40px_rgba(15,23,42,0.04)]">
      
      <NavLink 
        to="/" 
        className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-purple-600' : 'text-slate-400'}`}
      >
        <Home className="w-6 h-6" />
        <span className="text-[9px] font-bold tracking-widest uppercase">Início</span>
      </NavLink>

      <NavLink 
        to="/explore" 
        className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-purple-600' : 'text-slate-400'}`}
      >
        <Compass className="w-6 h-6" />
        <span className="text-[9px] font-bold tracking-widest uppercase">Explorar</span>
      </NavLink>

      <NavLink 
        to="/favorites" 
        className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-purple-600' : 'text-slate-400'}`}
      >
        <Heart className="w-6 h-6" />
        <span className="text-[9px] font-bold tracking-widest uppercase">Favoritos</span>
      </NavLink>

      <NavLink 
        to="/account" 
        className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-purple-600' : 'text-slate-400'}`}
      >
        <User className="w-6 h-6" />
        <span className="text-[9px] font-bold tracking-widest uppercase">Perfil</span>
      </NavLink>
      
    </div>
  );
}
