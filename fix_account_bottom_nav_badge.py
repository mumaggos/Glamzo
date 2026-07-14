import re

with open("src/pages/Account.tsx", "r") as f:
    text = f.read()

# Update the bottom nav loop
target_loop = """        {[
          { id: 'reservas', icon: Calendar, label: 'Reservas' },
          { id: 'apoio', icon: MessageSquare, label: 'Centro de Apoio' }
          
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center p-2 flex-1"
          >
            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-purple-600' : 'text-slate-400'}`} />
            <span className={`text-[10px] font-bold mt-1 ${activeTab === tab.id ? 'text-purple-600' : 'text-slate-500'}`}>{tab.label}</span>
          </button>
        ))}"""

replacement_loop = """        {[
          { id: 'reservas', icon: Calendar, label: 'Reservas' },
          { id: 'apoio', icon: MessageSquare, label: 'Centro de Apoio' }
          
        ].map(tab => {
          const hasNotification = tab.id === 'apoio' && (unreadMessages > 0 || pendingDisputes > 0);
          return (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center p-2 flex-1 relative"
          >
            <div className="relative">
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-purple-600' : 'text-slate-400'}`} />
              {hasNotification && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </div>
            <span className={`text-[10px] font-bold mt-1 ${activeTab === tab.id ? 'text-purple-600' : 'text-slate-500'}`}>{tab.label}</span>
          </button>
        )})}"""

text = text.replace(target_loop, replacement_loop)

# Let's also add it to the top tabs menu in Account.tsx
target_tabs = """        <div className="hidden lg:flex overflow-x-auto bg-white rounded-2xl shadow-lg border border-slate-100 p-2 gap-2 mb-8 no-scrollbar items-center">
          {[
            { id: 'reservas', icon: Calendar, label: 'Minhas Reservas' },
            { id: 'apoio', icon: MessageSquare, label: 'Centro de Apoio' },
            { id: 'perfil', icon: UserCircle, label: 'Editar Dados' },
            { id: 'recompensas', icon: Gift, label: 'Recompensas' },
            { id: 'favoritos', icon: Heart, label: 'Favoritos' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as 'reservas' | 'apoio' | 'perfil' | 'recompensas' | 'favoritos')} 
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex-1 justify-center ${activeTab === tab.id ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>"""

replacement_tabs = """        <div className="hidden lg:flex overflow-x-auto bg-white rounded-2xl shadow-lg border border-slate-100 p-2 gap-2 mb-8 no-scrollbar items-center">
          {[
            { id: 'reservas', icon: Calendar, label: 'Minhas Reservas' },
            { id: 'apoio', icon: MessageSquare, label: 'Centro de Apoio' },
            { id: 'perfil', icon: UserCircle, label: 'Editar Dados' },
            { id: 'recompensas', icon: Gift, label: 'Recompensas' },
            { id: 'favoritos', icon: Heart, label: 'Favoritos' }
          ].map(tab => {
            const hasNotification = tab.id === 'apoio' && (unreadMessages > 0 || pendingDisputes > 0);
            return (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as 'reservas' | 'apoio' | 'perfil' | 'recompensas' | 'favoritos')} 
              className={`relative flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex-1 justify-center ${activeTab === tab.id ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <div className="relative">
                <tab.icon className="w-4 h-4" />
                {hasNotification && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                )}
              </div>
              {tab.label}
            </button>
          )})}
        </div>"""

text = text.replace(target_tabs, replacement_tabs)

with open("src/pages/Account.tsx", "w") as f:
    f.write(text)
