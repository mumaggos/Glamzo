import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import interactionPlugin from '@fullcalendar/interaction';

interface DashboardCalendarProps {
  bookings: any[];
  services: any[];
  staff: any[];
  selectedStaffFilter: string;
  onStaffClick: (id: string) => void;
  onEventClick: (info: any) => void;
  onEventDrop: (info: any) => void;
  onDateSelect: (info: any) => void;
}

export function DashboardCalendar({ 
  bookings, 
  staff, 
  onEventClick, 
  onEventDrop, 
  onDateSelect 
}: DashboardCalendarProps) {
  
  // Transformar os dados para o formato do FullCalendar
  const events = bookings.map(b => ({
    id: b.id,
    resourceId: b.staff_id,
    title: b.notes || 'Marcação',
    start: `${b.booking_date}T${b.start_time}`,
    end: `${b.booking_date}T${b.end_time}`,
    extendedProps: { booking: b }
  }));

  const resources = staff.map(s => ({
    id: s.id,
    title: s.full_name
  }));

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, resourceTimeGridPlugin, interactionPlugin]}
      initialView="resourceTimeGridDay"
      resources={resources}
      events={events}
      editable={true}
      selectable={true}
      selectMirror={true}
      dayMaxEvents={true}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'resourceTimeGridDay,timeGridWeek'
      }}
      eventClick={onEventClick}
      eventDrop={onEventDrop}
      select={onDateSelect}
      locale="pt"
      height="auto"
      slotMinTime="08:00:00"
      slotMaxTime="21:00:00"
    />
  );
}
