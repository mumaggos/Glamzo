const fs = require('fs');
let content = fs.readFileSync('src/pages/staff/StaffDashboard.tsx', 'utf8');

const replacementQuery = `const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const limitDate = thirtyDaysAgo.toISOString().split('T')[0];

      const [bookingsRes, servicesRes, businessHoursRes] = await Promise.all([
        supabase
          .from("bookings")
          .select("*, customer_profile:profiles(full_name, avatar_url), service:services(name, duration_minutes, price)")
          .eq("business_id", businessId)
          .eq("staff_id", staffId)
          .gte("booking_date", limitDate)
          .neq("booking_status", "cancelled")
          .order("start_time", { ascending: true }),
        supabase
          .from("services")
          .select("*")
          .eq("business_id", businessId),
        supabase
          .from("business_hours")
          .select("*")
          .eq("business_id", businessId)
      ]);

      if (bookingsRes.data) setBookings(bookingsRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
      if (businessHoursRes.data) setBusinessHours(businessHoursRes.data);`;

content = content.replace(/const today = new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\];[\s\S]*?if \(servicesRes\.data\) setServices\(servicesRes\.data\);/m, replacementQuery);

// Add missing state for DashboardCalendar
const imports = `import { DashboardCalendar } from "../../components/DashboardCalendar";\nimport { LogOut, Calendar, Clock, User, Scissors, Settings, Camera, Plus, X, Trash2 } from "lucide-react";`;
content = content.replace('import { LogOut, Calendar, Clock, User, Scissors, Settings, Camera } from "lucide-react";', imports);

const moreState = `  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const [agendaMode, setAgendaMode] = useState<"day" | "3days" | "week">("day");
  const [selectedAgendaDate, setSelectedAgendaDate] = useState<string>(new Date().toISOString().split("T")[0]);
  
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [manualBookingType, setManualBookingType] = useState<"booking" | "block">("booking");
  const [manualClientName, setManualClientName] = useState("");
  const [manualReason, setManualReason] = useState("");
  const [manualServiceId, setManualServiceId] = useState("");
  const [manualDate, setManualDate] = useState(new Date().toISOString().split("T")[0]);
  const [manualStartTime, setManualStartTime] = useState("09:00");
  const [manualNotes, setManualNotes] = useState("");
  const [isSavingManual, setIsSavingManual] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);`;

content = content.replace('  const [view, setView] = useState<"agenda" | "settings">("agenda");', '  const [view, setView] = useState<"agenda" | "settings">("agenda");\n' + moreState);

// Replace Agenda view rendering
const renderAgenda = `        {view === "agenda" ? (
          <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                A Minha Agenda
              </h2>
              <div className="flex gap-2">
                 <button onClick={() => { setAgendaMode('day'); setSelectedAgendaDate(new Date().toISOString().split('T')[0]) }} className="text-xs px-3 py-1.5 rounded-full bg-slate-100 font-bold hover:bg-slate-200">Hoje</button>
                 <select value={agendaMode} onChange={(e: any) => setAgendaMode(e.target.value)} className="text-xs px-3 py-1.5 rounded-full bg-slate-100 font-bold hover:bg-slate-200 outline-none">
                    <option value="day">1 Dia</option>
                    <option value="3days">3 Dias</option>
                    <option value="week">Semana</option>
                 </select>
                 <button onClick={() => setIsManualBookingOpen(true)} className="text-xs px-3 py-1.5 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-700 flex items-center gap-1">
                    <Plus className="w-3 h-3"/> Nova
                 </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
               <DashboardCalendar 
                  bookings={bookings} 
                  staff={staff ? [staff] : []} 
                  businessHours={businessHours} 
                  selectedStaffFilter={staff?.id || "all"} 
                  agendaMode={agendaMode} 
                  selectedAgendaDate={selectedAgendaDate} 
                  onDateSelect={(args: any) => {
                     setManualDate(args.date);
                     setManualStartTime(args.time);
                     setIsManualBookingOpen(true);
                  }} 
                  onBookingClick={(b: any) => setSelectedBooking(b)} 
               />
            </div>
          </div>
        ) : (`;

content = content.replace(/        \{view === "agenda" \? \([\s\S]*?        \) : \(/, renderAgenda);

fs.writeFileSync('src/pages/staff/StaffDashboard.tsx', content);
