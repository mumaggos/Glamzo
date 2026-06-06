import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, LogOut, Briefcase, Search, Heart, Home as HomeIcon } from 'lucide-react';
import GlamzoLogo from './GlamzoLogo';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboardOrAdmin = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');
  const isPartnerPage = location.pathname.startsWith('/partner');

  const getProfileTargetRoute = (): string => {
    if (!user) return isPartnerPage ? '/partner/login' : '/login';
    if (!profile) return '/account';

    switch (profile.role) {
      case 'admin':
        return '/admin';
      case 'business':
        return '/dashboard';
      case 'customer':
      default:
        return '/account';
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      {/* 1. TOP PREMIUM HEADER BAR */}
      {!isDashboardOrAdmin && (
        <nav 
          id="navbar-top" 
          className="sticky top-0 z-40 w-full h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-colors"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
            {/* Logo */}
            <Link to={isPartnerPage ? "/partner" : "/"}>
              <GlamzoLogo size={32} withText={true} />
            </Link>

            {/* Middle Links - Desktop */}
            <div className="hidden md:flex items-center gap-6">
              {isPartnerPage ? (
                <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-all tracking-wide">
                  Ver Marketplace Clientes
                </Link>
              ) : (
                <>
                  <Link to="/explore" className="text-xs font-semibold text-slate-600 hover:text-purple-600 transition-all tracking-wide uppercase">
                    Explorar Salões
                  </Link>
                  {(!user || profile?.role === 'customer') && (
                    <Link to="/partner" className="text-[10px] font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 px-3.5 py-1.5 transition-all rounded-full border border-rose-200/55 hover:border-rose-450 tracking-wider">
                      ÁREA PARCEIRO
                    </Link>
                  )}
                  {profile?.role === 'business' && (
                    <Link to="/dashboard" className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-all">
                      Painel do Salão
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Auth section */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  {/* Badge */}
                  <span className="hidden sm:inline-block text-[9px] font-mono px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                    {profile?.role || 'user'}
                  </span>

                  {/* Profile Target */}
                  <Link
                    to={getProfileTargetRoute()}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs transition-all text-slate-700 hover:text-slate-950 hover:border-purple-500/40 shadow-sm"
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || 'User'}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          // If image fails, replace with a dummy empty source or hide it to trigger the fallback representation
                          e.currentTarget.style.display = 'none';
                          const fallbackSibling = e.currentTarget.nextElementSibling;
                          if (fallbackSibling) {
                            fallbackSibling.classList.remove('hidden');
                          }
                        }}
                        className="w-5 h-5 rounded-full object-cover border border-slate-100"
                      />
                    ) : null}
                    {/* Fallback container shown on missing or broken URL */}
                    <div className={`w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center ${profile?.avatar_url ? 'hidden' : ''}`}><User className="w-3 h-3 text-slate-500" /></div>
                    <span className="max-w-[90px] truncate font-medium">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </span>
                  </Link>

                  {/* Sign Out */}
                  <button
                    onClick={handleSignOut}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
                    title="Terminar Sessão"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to={isPartnerPage ? "/partner/login" : "/login"}
                    className="text-xs sm:text-sm px-3.5 py-2 text-slate-600 hover:text-slate-900 transition-all font-medium"
                  >
                    Entrar
                  </Link>
                  <Link
                    to={isPartnerPage ? "/partner/signup" : "/signup"}
                    className="text-xs sm:text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-semibold shadow-sm shadow-purple-200 transition-all hover:scale-[1.01]"
                  >
                    {isPartnerPage ? "Registar" : "Criar Conta"}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* 2. FLOATING BOTTOM NAVIGATION BAR (APPLE & AIRBNB STYLE) */}
      {!isDashboardOrAdmin && (
        <div 
          id="floating-bottom-nav" 
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[92%] sm:w-[480px] bg-white/95 backdrop-blur-md border border-slate-200/70 rounded-2xl p-2 px-3.5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
        >
          <div className="flex items-center justify-around relative">
            
            {/* Button 1: Home page */}
            <Link 
              to="/" 
              className={`flex flex-col items-center gap-0.5 p-1 px-2.5 rounded-xl transition-all ${
                location.pathname === '/' ? 'text-purple-600 scale-[1.02]' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <HomeIcon className="w-5 h-5 stroke-[2]" />
              <span className="text-[9px] font-bold tracking-wide uppercase font-mono">Início</span>
              {location.pathname === '/' && <span className="w-1 h-1 bg-purple-600 rounded-full mt-0.5" />}
            </Link>

            {/* Button 2: Explore list */}
            <Link 
              to="/explore" 
              className={`flex flex-col items-center gap-0.5 p-1 px-2.5 rounded-xl transition-all ${
                location.pathname === '/explore' ? 'text-purple-600 scale-[1.02]' : 'text-slate-550 hover:text-slate-900'
              }`}
            >
              <Search className="w-5 h-5 stroke-[2]" />
              <span className="text-[9px] font-bold tracking-wide uppercase font-mono">Pesquisa</span>
              {location.pathname === '/explore' && <span className="w-1 h-1 bg-purple-600 rounded-full mt-0.5" />}
            </Link>

            {/* Center Button: Glamzo Original Purple G Logo highlighted with star */}
            <Link 
              to="/explore" 
              className="relative -top-4 hover:scale-105 active:scale-95 transition-transform duration-300 block shrink-0"
              title="Explorar Serviços Premium"
            >
              <GlamzoLogo size={46} showSquircle={true} glow={true} />
            </Link>

            {/* Button 3: Account (or Log in if not logged in) */}
            <Link 
              to={user ? "/account" : "/login"} 
              className={`flex flex-col items-center gap-0.5 p-1 px-2.5 rounded-xl transition-all ${
                location.pathname === '/account' || location.pathname === '/login' ? 'text-purple-600 scale-[1.02]' : 'text-slate-550 hover:text-slate-900'
              }`}
            >
              <Heart className="w-5 h-5 stroke-[2]" />
              <span className="text-[9px] font-bold tracking-wide uppercase font-mono">Favoritos</span>
              {(location.pathname === '/account' || location.pathname === '/login') && <span className="w-1 h-1 bg-purple-600 rounded-full mt-0.5" />}
            </Link>

            {/* Button 4: Dashboard/Admin control hub OR Partner link */}
            <Link 
              to={getProfileTargetRoute()} 
              className={`flex flex-col items-center gap-0.5 p-1 px-2.5 rounded-xl transition-all ${
                location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/partner')
                  ? 'text-purple-600 scale-[1.02]' 
                  : 'text-slate-550 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-5 h-5 stroke-[2]" />
              <span className="text-[9px] font-bold tracking-wide uppercase font-mono">Gestão</span>
              {(location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/partner')) && (
                <span className="w-1 h-1 bg-purple-600 rounded-full mt-0.5" />
              )}
            </Link>

          </div>
        </div>
      )}
    </>
  );
}
