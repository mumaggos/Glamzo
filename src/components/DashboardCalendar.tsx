import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptLocale from '@fullcalendar/core/locales/pt'; // Importar tradução

export function DashboardCalendar({ bookings, staff, onEventClick, onEventDrop, onDateSelect }: any) {
  
  const events = bookings.map(b => ({
    id: b.id,
    resourceId: b.staff_id,
    title: b.notes || 'Marcação',
    start: `${b.booking_date}T${b.start_time}`,
    end: `${b.booking_date}T${b.end_time}`,
    backgroundColor: '#8b5cf6', // Roxo premium
    borderColor: '#8b5cf6',
  }));

  const resources = staff.map(s => ({
    id: s.id,
    title: s.full_name,
    // Se o FullCalendar suportar renderização de imagem, passamos a URL aqui
    extendedProps: { avatar: s.avatar_url } 
  }));

  return (
    <div className="calendar-container h-full overflow-y-auto">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, resourceTimeGridPlugin, interactionPlugin]}
        initialView="resourceTimeGridDay"
        resources={resources}
        events={events}
        locale={ptLocale} // Forçar português
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'resourceTimeGridDay,timeGridWeek'
        }}
        slotLabelFormat={{ hour: '2-digit', minute: '2-digit' }}
        eventContent={(arg) => (
          <div className="p-1 text-xs font-semibold overflow-hidden">
            {arg.event.title}
          </div>
        )}
        resourceLabelContent={(arg) => (
          <div className="flex flex-col items-center gap-1 py-2">
            {arg.resource.extendedProps.avatar ? (
              <img src={arg.resource.extendedProps.avatar} className="w-8 h-8 rounded-full object-cover border border-purple-200" alt="" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] uppercase font-bold">
                {arg.resource.title.charAt(0)}
              </div>
            )}
            <span className="text-[10px] font-bold text-slate-700">{arg.resource.title}</span>
          </div>
        )}
        height="100%"
        editable={true}
        selectable={true}
        eventClick={onEventClick}
        eventDrop={onEventDrop}
        select={onDateSelect}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
      />
    </div>
  );
}
