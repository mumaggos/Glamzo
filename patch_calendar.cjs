const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardCalendar.tsx', 'utf8');

// Update function signature
code = code.replace(/export function DashboardCalendar\(\{ bookings, staff, selectedStaffFilter, agendaMode, selectedAgendaDate, onDateSelect, onBookingClick \}: any\) \{/,
'export function DashboardCalendar({ bookings, staff, selectedStaffFilter, agendaMode, selectedAgendaDate, onDateSelect, onBookingClick, businessHours }: any) {');

const logic = `
  const computedHours = useMemo(() => {
    if (!businessHours || businessHours.length === 0) {
      return Array.from({ length: 14 }, (_, i) => i + 8);
    }
    const openH = businessHours.map((h) => {
      if (!h.open_time || h.is_closed) return 8;
      return parseInt(h.open_time.split(':')[0]);
    });
    const closeH = businessHours.map((h) => {
      if (!h.close_time || h.is_closed) return 20;
      return parseInt(h.close_time.split(':')[0]);
    });
    const minH = Math.min(...openH.filter(x => !isNaN(x)), 8);
    const maxH = Math.max(...closeH.filter(x => !isNaN(x)), 20);
    const len = (maxH - minH) + 1;
    return Array.from({ length: len > 0 ? len : 14 }, (_, i) => i + minH);
  }, [businessHours]);
`;

code = code.replace(/const hours = Array\.from\(\{ length: 14 \}, \(\_, i\) => i \+ 8\);/, logic + '\n  const hours = computedHours;');

fs.writeFileSync('src/components/DashboardCalendar.tsx', code);
