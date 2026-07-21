import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, LogOut, Briefcase, Search, Heart, Home as HomeIcon } from 'lucide-react';
import GlamzoLogo from './GlamzoLogo';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboardOrAdmin = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff') || location.pathname.startsWith('/partner/dashboard') || location.pathname.startsWith('/chamadas');
  const isPartnerPage = location.pathname.startsWith('/partner');
  const isDarkNavbar = false; // Force light navbar everywhere to match site's style

  const getProfileTargetRoute = (): string => {
    if (!user) return isPartnerPage ? '/partner/login' : '/login';
    if (!profile) return '/account';

    switch (profile.role) {
      case 'admin':
        return '/admin';
      case 'business':
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
          className={`sticky top-0 z-40 w-full h-16 ${
            isDarkNavbar 
              ? 'bg-slate-950/75 border-b border-slate-900/80 text-white' 
              : 'bg-white/80 border-b border-slate-100 text-slate-800'
          } backdrop-blur-md transition-colors`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
            {/* Logo */}
            <Link to="/">
              <GlamzoLogo size={32} withText={true} forceDark={!isDarkNavbar} />
            </Link>

            {/* Middle Links - Desktop */}
            <div className="hidden md:flex items-center gap-6">
              {isPartnerPage ? (
                <Link to="/" className={`text-xs font-semibold ${isDarkNavbar ? 'text-slate-600 hover:text-white' : 'text-slate-500 hover:text-slate-900'} transition-all tracking-wide`}>
                  Ver Marketplace Clientes
                </Link>
              ) : (
                <>
                  <Link to="/explore" className={`text-xs font-semibold ${isDarkNavbar ? 'text-slate-300 hover:text-purple-400' : 'text-slate-600 hover:text-purple-600'} transition-all tracking-wide uppercase`}>
                    Explorar Parceiros
                  </Link>
                  {user && profile?.role === 'customer' && (
                    <Link 
                      to="/partner" 
                      className={`text-[10px] font-bold ${
                        isDarkNavbar 
                          ? 'text-purple-400 bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800/30' 
                          : 'text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-200/55 hover:border-rose-450'
                      } px-3.5 py-1.5 transition-all rounded-full tracking-wider`}
                    >
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
                  <span className={`hidden sm:inline-block text-[9px] font-mono px-2 py-0.5 rounded-md border ${
                    isDarkNavbar 
                      ? 'border-slate-800 bg-slate-900 text-slate-600 font-extrabold' 
                      : 'border-slate-200 bg-slate-50 text-slate-500 font-bold'
                  } uppercase tracking-wider`}>
                    {profile?.role || 'user'}
                  </span>

                  {/* Profile Target */}
                  <Link
                    to={getProfileTargetRoute()}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                      isDarkNavbar 
                        ? 'border-slate-850 bg-slate-900/50 text-slate-300 hover:text-white hover:border-purple-500/30 shadow-lg shadow-black/20' 
                        : 'border-slate-200 bg-white text-slate-700 hover:text-slate-950 hover:border-purple-500/40 shadow-sm'
                    } text-xs transition-all`}
                  >
                    {profile?.avatar_url ? (
                      <img loading="lazy"
                        src={profile.avatar_url}
                        alt={profile.full_name || 'User'}
                        
                        className="w-5 h-5 rounded-full object-cover border border-slate-805/30"
                      />
                    ) : (
                      <div className={`w-5 h-5 rounded-full ${isDarkNavbar ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center`}><User className="w-3 h-3 text-slate-500" /></div>
                    )}
                    <span className="max-w-[90px] truncate font-medium">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </span>
                  </Link>

                  {/* Sign Out */}
                  <button
                    onClick={handleSignOut}
                    className={`p-1.5 rounded-xl border border-transparent transition-all ${
                      isDarkNavbar 
                        ? 'text-slate-600 hover:text-rose-400 hover:bg-rose-950/30 hover:border-rose-900/40' 
                        : 'text-slate-600 hover:text-rose-600 hover:bg-rose-550/10 hover:border-rose-100'
                    }`}
                    title="Terminar Sessão"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to={isPartnerPage ? "/partner/login" : "/login"}
                    className={`text-xs sm:text-sm px-3.5 py-2 ${isDarkNavbar ? 'text-slate-300 hover:text-white' : 'text-slate-650 hover:text-slate-900'} transition-all font-medium`}
                  >
                    Entrar
                  </Link>
                  <Link
                    to={isPartnerPage ? "/partner/signup" : "/signup"}
                    className="text-xs sm:text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-semibold shadow-md shadow-purple-950/20 transition-all hover:scale-[1.01]"
                  >
                    {isPartnerPage ? "Registar" : "Criar Conta"}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}

      </>
  );
}
