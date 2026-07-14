import re

with open("src/pages/Account.tsx", "r") as f:
    text = f.read()

# 1. Add dateFilter state
if "const [dateFilter, setDateFilter] = useState('hoje');" not in text:
    state_injection = """  const [dateFilter, setDateFilter] = useState<'hoje'|'semana'|'mes'|'intervalo'|'todos'>('hoje');
  const [customDate, setCustomDate] = useState('');"""
    text = text.replace("const [showAllBookings, setShowAllBookings] = useState(false);",
                        state_injection + "\n  const [showAllBookings, setShowAllBookings] = useState(false);")

# 2. Add filtering logic before rendering
target_render = "            {loadingBookings ? ("
replacement_render = """
            {/* Filtro de Reservas */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <button 
                onClick={() => setDateFilter('todos')} 
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${dateFilter === 'todos' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Todas
              </button>
              <button 
                onClick={() => setDateFilter('hoje')} 
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${dateFilter === 'hoje' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Hoje
              </button>
              <button 
                onClick={() => setDateFilter('semana')} 
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${dateFilter === 'semana' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Esta Semana
              </button>
              <button 
                onClick={() => setDateFilter('mes')} 
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${dateFilter === 'mes' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Este Mês
              </button>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setDateFilter('intervalo')} 
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${dateFilter === 'intervalo' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Data Específica
                </button>
                {dateFilter === 'intervalo' && (
                  <input 
                    type="date" 
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-700 outline-none focus:border-purple-500 bg-white"
                  />
                )}
              </div>
            </div>

            {loadingBookings ? ("""

if "{/* Filtro de Reservas */}" not in text:
    text = text.replace(target_render, replacement_render)

# 3. Apply the filter to the map function
# I need to create the filtered bookings variable, or apply it directly before mapping.
# Wait, let's just create a `filteredBookings` variable at the top of the render block.

if "const filteredBookings =" not in text:
    filtered_logic = """  const filteredBookings = bookings.filter(bk => {
    if (dateFilter === 'todos') return true;
    
    const bkDate = new Date(bk.booking_date);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (dateFilter === 'hoje') {
      const bDate = new Date(bkDate);
      bDate.setHours(0,0,0,0);
      return bDate.getTime() === today.getTime();
    }
    
    if (dateFilter === 'semana') {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return bkDate >= today && bkDate <= nextWeek;
    }
    
    if (dateFilter === 'mes') {
      return bkDate.getMonth() === today.getMonth() && bkDate.getFullYear() === today.getFullYear();
    }
    
    if (dateFilter === 'intervalo' && customDate) {
      const cDate = new Date(customDate);
      cDate.setHours(0,0,0,0);
      const bDate = new Date(bkDate);
      bDate.setHours(0,0,0,0);
      return bDate.getTime() === cDate.getTime();
    }
    
    return dateFilter === 'intervalo' && !customDate ? true : false;
  });"""

    text = text.replace("return (\n    <div className=", filtered_logic + "\n\n  return (\n    <div className=")

text = text.replace("{(showAllBookings ? bookings : bookings.slice(0, 5)).map(bk => {",
                    "{(showAllBookings ? filteredBookings : filteredBookings.slice(0, 5)).map(bk => {")

text = text.replace("bookings.length === 0 ?", "filteredBookings.length === 0 ?")

# Also need to make sure 'todos' is the default if they want to see all?
# "O padrão (default) deve ser sempre 'Hoje'." -> but if they click today, and there's none, the fallback is empty. That's fine.

with open("src/pages/Account.tsx", "w") as f:
    f.write(text)
