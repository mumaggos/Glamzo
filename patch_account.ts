import fs from 'fs';

let content = fs.readFileSync('src/pages/Account.tsx', 'utf-8');

// Fix imports
content = content.replace("import { submitSupportQuery, fetchSupportTickets }", "import { submitSupportQuery, fetchSupportTickets, createSupportTicket }");

// Add showAllBookings state
content = content.replace("const [bookings, setBookings] = useState<any[]>([]);", "const [bookings, setBookings] = useState<any[]>([]);\n  const [showAllBookings, setShowAllBookings] = useState(false);");

// Fix tabs menu visibility (hide on mobile)
content = content.replace('className="flex overflow-x-auto bg-white rounded-2xl shadow-lg border border-slate-100 p-2 gap-2 mb-8 no-scrollbar"', 'className="hidden lg:flex overflow-x-auto bg-white rounded-2xl shadow-lg border border-slate-100 p-2 gap-2 mb-8 no-scrollbar"');

// Fix bookings pagination
content = content.replace("{bookings.map(bk => {", "{(showAllBookings ? bookings : bookings.slice(0, 5)).map(bk => {");

content = content.replace(
  "</>            )}          </div>          <button", 
  "</>\n            )}\n            {bookings.length > 5 && !showAllBookings && (\n              <div className=\"flex justify-center mt-6\">\n                <button onClick={() => setShowAllBookings(true)} className=\"px-6 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors\">\n                  Ver Histórico Completo\n                </button>\n              </div>\n            )}\n          </div>\n          <button"
);

// Fallback replacement if the above replace fails due to mismatch:
if (!content.includes('bookings.length > 5 && !showAllBookings')) {
  content = content.replace(
    '                    </div>                  );                })}              </div>',
    '                    </div>                  );                })}                {bookings.length > 5 && !showAllBookings && (                  <div className="flex justify-center mt-6">                    <button onClick={() => setShowAllBookings(true)} className="px-6 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">                      Ver Histórico Completo                    </button>                  </div>                )}              </div>'
  );
}

// Add Favorites Tab Content
const favoritesTab = `
        {/* FAVORITOS */}
        {activeTab === 'favoritos' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/60">
              <h3 className="text-xl font-black text-slate-900 mb-6">Salões Guardados</h3>
              {loadingFavorites ? (
                <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
              ) : favoriteBusinesses.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-100">
                  <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-slate-800">Sem favoritos</h4>
                  <p className="text-xs text-slate-500 mt-2 mb-4">Ainda não guardou nenhum salão.</p>
                  <a href="/explore" className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold inline-block hover:bg-purple-700">Explorar Salões</a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favoriteBusinesses.map(biz => (
                    <div key={biz.id} className="border border-slate-200 rounded-2xl p-4 flex gap-4 items-center bg-white hover:border-purple-300 transition-colors">
                      {biz.logo_url ? (
                        <img src={biz.logo_url} alt={biz.name} className="w-16 h-16 rounded-xl object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-sm">{biz.name}</h4>
                        <p className="text-xs text-slate-500">{biz.city || 'Portugal'}</p>
                        <div className="mt-2 flex gap-2">
                          <a href={\`/salao/\${biz.id}\`} className="text-[10px] font-bold bg-purple-50 hover:bg-purple-600 hover:text-white transition-colors text-purple-700 px-3 py-1.5 rounded-lg">Reservar</a>
                          <button onClick={() => handleRemoveFavorite(biz.id)} className="text-[10px] font-bold bg-rose-50 hover:bg-rose-500 hover:text-white transition-colors text-rose-600 px-3 py-1.5 rounded-lg">Remover</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
`;

content = content.replace("{/* 4. SUPORTE E DISPUTAS */}", favoritesTab + "\n        {/* 4. SUPORTE E DISPUTAS */}");

// Fix handleSendSupportMessage
content = content.replace(
  "setSupportMessages(await submitSupportQuery(user.id, nameOfUser, supportInput.trim()));",
  "await createSupportTicket(user.id, nameOfUser, null, null, `Dúvida enviada via Suporte Técnico: \"\${supportInput.trim()}\"`);\n      // Opcional: continuar a usar a IA no background se quisermos\n      // await submitSupportQuery(user.id, nameOfUser, supportInput.trim());"
);

// Add bottom nav for mobile
const bottomNav = `
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
      </div>
`;

content = content.replace("    </div>\n  );\n}", bottomNav + "    </div>\n  );\n}");

fs.writeFileSync('src/pages/Account.tsx', content);
