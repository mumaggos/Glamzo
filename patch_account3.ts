import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Account.tsx', 'utf8');

const searchDesktop = `        {/* Menu de Abas */}
        <div className="hidden lg:flex overflow-x-auto bg-white rounded-2xl shadow-lg border border-slate-100 p-2 gap-2 mb-8 no-scrollbar">
          {[
            { id: 'reservas', icon: Calendar, label: 'Minhas Reservas' },
            { id: 'perfil', icon: UserCircle, label: 'Editar Dados' },
            { id: 'recompensas', icon: Gift, label: 'Recompensas' },
            { id: 'favoritos', icon: Heart, label: 'Favoritos' },
            { id: 'suporte', icon: HelpCircle, label: 'Apoio Técnico' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={\`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap \${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}\`}
            >
              <tab.icon className="w-4 h-4 shrink-0" /> {tab.label}
            </button>
          ))}
        </div>`;

const replaceDesktop = `        {/* Menu de Abas */}
        <div className="hidden lg:flex overflow-x-auto bg-white rounded-2xl shadow-lg border border-slate-100 p-2 gap-2 mb-8 no-scrollbar items-center">
          {[
            { id: 'reservas', icon: Calendar, label: 'Minhas Reservas' },
            { id: 'perfil', icon: UserCircle, label: 'Editar Dados' },
            { id: 'recompensas', icon: Gift, label: 'Recompensas' },
            { id: 'favoritos', icon: Heart, label: 'Favoritos' },
            { id: 'suporte', icon: HelpCircle, label: 'Apoio Técnico' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={\`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap \${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}\`}
            >
              <tab.icon className="w-4 h-4 shrink-0" /> {tab.label}
            </button>
          ))}
          <div className="flex-1"></div>
          <Link to="/explore" className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all whitespace-nowrap bg-gradient-to-r from-purple-600 to-rose-500 text-white shadow-lg hover:shadow-xl hover:scale-105 shrink-0">
            <Compass className="w-5 h-5" /> Explorar Lojas
          </Link>
        </div>`;

content = content.replace(searchDesktop, replaceDesktop);

const searchMobile = `      {/* FAB - Explorar */}
      <Link to="/explore" className="fixed bottom-24 lg:bottom-10 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg shadow-purple-600/30 hover:bg-purple-700 hover:scale-105 transition-all z-[60] flex items-center justify-center group">
        <Compass className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </Link>
      
      {/* Bottom Nav para Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t pb-safe pt-2 px-6 flex justify-between items-center z-[50] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {[
          { id: 'reservas', icon: Calendar, label: 'Reservas' },
          { id: 'perfil', icon: UserCircle, label: 'Perfil' },
          { id: 'recompensas', icon: Gift, label: 'Prémios' },
          { id: 'favoritos', icon: Heart, label: 'Favoritos' },
          { id: 'suporte', icon: HelpCircle, label: 'Suporte' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center p-2"
          >
            <tab.icon className={\`w-6 h-6 \${activeTab === tab.id ? 'text-purple-600' : 'text-slate-400'}\`} />
            <span className={\`text-[10px] font-bold mt-1 \${activeTab === tab.id ? 'text-purple-600' : 'text-slate-500'}\`}>{tab.label}</span>
          </button>
        ))}
      </div>`;

const replaceMobile = `      {/* Bottom Nav para Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t pb-safe pt-2 px-4 flex justify-between items-center z-[50] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {[
          { id: 'reservas', icon: Calendar, label: 'Reservas' },
          { id: 'perfil', icon: UserCircle, label: 'Perfil' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center p-2 flex-1"
          >
            <tab.icon className={\`w-5 h-5 \${activeTab === tab.id ? 'text-purple-600' : 'text-slate-400'}\`} />
            <span className={\`text-[10px] font-bold mt-1 \${activeTab === tab.id ? 'text-purple-600' : 'text-slate-500'}\`}>{tab.label}</span>
          </button>
        ))}
        
        <Link to="/explore" className="flex flex-col items-center px-4 -mt-6">
          <div className="bg-gradient-to-r from-purple-600 to-rose-500 p-4 rounded-full shadow-lg shadow-purple-500/40 text-white mb-1">
            <Compass className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black text-slate-800">Explorar</span>
        </Link>

        {[
          { id: 'favoritos', icon: Heart, label: 'Favoritos' },
          { id: 'suporte', icon: HelpCircle, label: 'Suporte' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center p-2 flex-1"
          >
            <tab.icon className={\`w-5 h-5 \${activeTab === tab.id ? 'text-purple-600' : 'text-slate-400'}\`} />
            <span className={\`text-[10px] font-bold mt-1 \${activeTab === tab.id ? 'text-purple-600' : 'text-slate-500'}\`}>{tab.label}</span>
          </button>
        ))}
      </div>`;

content = content.replace(searchMobile, replaceMobile);

fs.writeFileSync('src/pages/Account.tsx', content);
