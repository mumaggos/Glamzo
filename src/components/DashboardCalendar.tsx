import React from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptLocale from '@fullcalendar/core/locales/pt';

export function DashboardCalendar({ bookings, staff, onEventClick, onEventDrop, onDateSelect }: any) {
  return (
    <div className="h-full w-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-2">
      <style>{`
        .fc .fc-toolbar-title { font-weight: 800 !important; color: #1e293b !important; }
        .fc-event { border-radius: 8px !important; padding: 4px !important; border: none !important; }
        .fc-resource-timegrid-slot { height: 60px !important; }
        .fc .fc-resource-timeline-header-row th { background: #f8fafc !important; }
      `}</style>
      
      <FullCalendar
        plugins={[resourceTimeGridPlugin, interactionPlugin]}
        initialView="resourceTimeGridDay"
        resources={staff.map(s => ({ id: s.id, title: s.full_name, avatar: s.avatar_url }))}
        events={bookings.map(b => ({
          id: b.id,
          resourceId: b.staff_id,
          title: b.notes || 'Marcação',
          start: `${b.booking_date}T${b.start_time}`,
          end: `${b.booking_date}T${b.end_time}`,
          className: 'bg-purple-600 text-white border-none shadow-md' // Tailwind aqui!
        }))}
        locale={ptLocale}
        headerToolbar={{ left: 'prev,next', center: 'title', right: 'resourceTimeGridDay' }}
        resourceLabelContent={(arg) => (
          <div className="flex flex-col items-center py-2">
            <img src={arg.resource.extendedProps.avatar || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full mb-1 object-cover border-2 border-purple-100" alt="" />
            <span className="text-[10px] font-bold text-slate-800">{arg.resource.title}</span>
          </div>
        )}
        height="100%"
        editable={true}
        selectable={true}
        eventClick={onEventClick}
        eventDrop={onEventDrop}
        select={onDateSelect}
      />
    </div>
  );
}
