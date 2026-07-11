import fs from 'fs';

let content = fs.readFileSync('src/components/DashboardCalendar.tsx', 'utf-8');

// Replace export function
content = content.replace(
  /export function DashboardCalendar\(\{ bookings, staff, businessHours, selectedStaffFilter, agendaMode, selectedAgendaDate, onDateSelect, onBookingClick \}: any\) \{/,
  "export function DashboardCalendar({ business, bookings, staff, businessHours, selectedStaffFilter, agendaMode, selectedAgendaDate, onDateSelect, onBookingClick }: any) {"
);

const hoursLogic = `  const hours = useMemo(() => {
    let minH = 8;
    let maxH = 20; // Inclusive limit
    
    if (businessHours && businessHours.length > 0) {
      minH = 24;
      maxH = 0;
      columns.forEach((col: any) => {
        const dayHours = businessHours.find((h: any) => h.weekday === col.weekday);
        if (dayHours && !dayHours.is_closed) {
          const startH = parseInt(dayHours.open_time.split(':')[0], 10);
          const endH = parseInt(dayHours.close_time.split(':')[0], 10);
          if (startH < minH) minH = startH;
          if (endH > maxH) maxH = endH;
        }
      });
      // Fallbacks if all selected columns are closed
      if (minH === 24) minH = 8;
      if (maxH === 0) maxH = 20;
    } else if (business?.opening_time && business?.closing_time) {
      minH = parseInt(business.opening_time.split(':')[0], 10);
      maxH = parseInt((business.end_time || business.closing_time).split(':')[0], 10);
    }
    
    const length = maxH - minH + 1;
    return Array.from({ length }, (_, i) => i + minH);
  }, [columns, businessHours, business]);`;

content = content.replace(/const hours = useMemo\(\(\) => \{[\s\S]*?\}, \[columns, businessHours\]\);/, hoursLogic);

fs.writeFileSync('src/components/DashboardCalendar.tsx', content);
