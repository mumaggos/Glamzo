import React, { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { motion } from 'motion/react';
import { Booking, Service, Staff } from '../types';

interface DashboardCalendarProps {
  bookings: Booking[];
  services: Service[];
  staff: Staff[];
  onEventClick: (info: any) => void;
  onEventDrop: (info: any) => void;
  onDateSelect: (info: any) => void;
}

export function DashboardCalendar({
  bookings,
  services,
  staff,
  onEventClick,
  onEventDrop,
  onDateSelect
}: DashboardCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  
  // Assign colors to staff
  const staffColors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];
  const getStaffColor = (staffId: string | null) => {
    if (!staffId) return '#64748b';
    const index = staff.findIndex(s => s.id === staffId);
    return index !== -1 ? staffColors[index % staffColors.length] : '#64748b';
  };

  const events = bookings
    .filter(b => b.booking_status !== 'cancelled')
    .map(b => {
      const srv = services.find(s => s.id === b.service_id);
      const stf = staff.find(s => s.id === b.staff_id);
      const clientName = b.customer_profile?.full_name || 'Cliente';
      
      return {
        id: b.id,
        title: `${clientName} - ${srv?.name || 'Serviço'}`,
        start: `${b.booking_date}T${b.start_time}`,
        end: `${b.booking_date}T${b.end_time}`,
        backgroundColor: getStaffColor(b.staff_id),
        borderColor: 'transparent',
        extendedProps: {
          booking: b
        }
      };
    });

  
  const renderEventContent = (eventInfo: any) => {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.2, type: "spring", bounce: 0.4 }}
        className="w-full h-full flex flex-col justify-start overflow-hidden px-1"
      >
        <div className="font-bold text-[10px] sm:text-xs truncate leading-tight">{eventInfo.timeText}</div>
        <div className="text-[10px] sm:text-xs truncate font-medium">{eventInfo.event.title}</div>
      </motion.div>
    );
  };
  return (

    <div className="bg-white p-0 md:p-2 rounded-2xl w-full">
      <style>
        {`
          .fc-theme-standard td, .fc-theme-standard th { border-color: #f1f5f9; border-width: 1px; }
          .fc-col-header-cell { background-color: #f8fafc; padding: 8px 0; color: #475569; font-weight: 700; font-size: 13px; text-transform: capitalize; }
          .fc-day-today { background-color: #f5f3ff !important; }
          .fc-button-primary { background-color: #f1f5f9 !important; border-color: #e2e8f0 !important; color: #475569 !important; font-weight: 600 !important; font-size: 13px !important; box-shadow: none !important; border-radius: 8px !important; }
          .fc-button-primary:hover { background-color: #e2e8f0 !important; color: #0f172a !important; }
          .fc-button-active { background-color: #9333ea !important; border-color: #7e22ce !important; color: white !important; }
          .fc-button-active:hover { background-color: #7e22ce !important; }
          .fc-toolbar-title { font-size: 1.25rem !important; font-weight: 800 !important; color: #0f172a !important; text-transform: capitalize; }
          .fc-event { cursor: pointer; border-radius: 6px; padding: 2px 4px; box-shadow: none; }
          .fc-timegrid-slot-label { font-size: 11px; color: #94a3b8; font-weight: 600; }
        `}
      </style>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridDay,timeGridThreeDay,timeGridWeek,dayGridMonth'
        }}
        views={{
          timeGridThreeDay: {
            type: 'timeGrid',
            duration: { days: 3 },
            buttonText: '3 Dias'
          },
          timeGridDay: { buttonText: 'Dia' },
          timeGridWeek: { buttonText: 'Semana' },
          dayGridMonth: { buttonText: 'Mês' },
          today: { buttonText: 'Hoje' }
        }}
        locale="pt"
        events={events}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        slotDuration="00:15:00"
        slotLabelInterval="01:00"
        eventClick={onEventClick}
        eventDrop={onEventDrop}
        eventContent={renderEventContent}
        select={onDateSelect}
        height="75vh"
        nowIndicator={true}
      />
    </div>
  );
}
