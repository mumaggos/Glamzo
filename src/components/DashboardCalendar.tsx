import React, { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import { motion } from 'motion/react';
import { Booking, Service, Staff } from '../types';

interface DashboardCalendarProps {
  bookings: Booking[];
  services: Service[];
  staff: Staff[];
  selectedStaffFilter: string;
  onEventClick: (info: any) => void;
  onEventDrop: (info: any) => void;
  onDateSelect: (info: any) => void;
  onStaffClick?: (staffId: string) => void;
}

export function DashboardCalendar({
  bookings,
  services,
  staff,
  selectedStaffFilter,
  onEventClick,
  onEventDrop,
  onDateSelect,
  onStaffClick
}: DashboardCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    // If filter changes, change view automatically
    const api = calendarRef.current?.getApi();
    if (api) {
      if (selectedStaffFilter === 'all') {
        if (api.view.type !== 'resourceTimeGridDay') {
          api.changeView('resourceTimeGridDay');
        }
      } else {
        if (api.view.type === 'resourceTimeGridDay') {
          api.changeView('timeGridWeek');
        }
      }
    }
  }, [selectedStaffFilter]);

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
        resourceId: b.staff_id || undefined,
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

  const resources = staff.map(s => ({
    id: s.id,
    title: s.full_name,
    avatar: s.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + s.id
  }));

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

  const renderResourceLabel = (resourceInfo: any) => {
    const s = resourceInfo.resource.extendedProps;
    return (
      <div 
        className="flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-slate-50 transition"
        onClick={() => onStaffClick && onStaffClick(resourceInfo.resource.id)}
      >
        <img src={s.avatar} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white shadow-sm mb-2 object-cover" />
        <span className="font-bold text-sm text-slate-800">{resourceInfo.resource.title.split(' ')[0]}</span>
      </div>
    );
  };

  const viewMode = selectedStaffFilter === 'all' ? 'resourceTimeGridDay' : 'timeGridWeek';

  return (
    <div className="bg-white p-0 md:p-2 rounded-2xl w-full">
      <style>
        {`
          /* Subtle borders */
          .fc-theme-standard td, .fc-theme-standard th { border-color: #f1f5f9; border-width: 1px; }
          .fc-col-header-cell { background-color: #ffffff; padding: 0; color: #475569; font-weight: 700; text-transform: capitalize; border-bottom: 2px solid #f1f5f9; }
          .fc-day-today { background-color: #fafaf9 !important; }
          
          /* FullCalendar Buttons */
          .fc-button-primary { background-color: #f1f5f9 !important; border-color: #e2e8f0 !important; color: #475569 !important; font-weight: 600 !important; font-size: 13px !important; box-shadow: none !important; border-radius: 8px !important; }
          .fc-button-primary:hover { background-color: #e2e8f0 !important; color: #0f172a !important; }
          .fc-button-active { background-color: #9333ea !important; border-color: #7e22ce !important; color: white !important; }
          .fc-button-active:hover { background-color: #7e22ce !important; }
          
          /* Headers & Titles */
          .fc-toolbar-title { font-size: 1.25rem !important; font-weight: 800 !important; color: #0f172a !important; text-transform: capitalize; }
          .fc-event { cursor: pointer; border-radius: 6px; padding: 2px 4px; box-shadow: none; border: 1px solid rgba(255,255,255,0.2) !important; }
          .fc-timegrid-slot-label { font-size: 11px; color: #64748b; font-weight: 700; }
          
          /* Hide license message */
          .fc-license-message { display: none !important; }
          
          /* Time column fixed width */
          .fc-timegrid-axis { width: 50px !important; }
          .fc-timegrid-slot-label-cushion { padding-right: 8px !important; }
          .fc-scroller-liquid-absolute { overflow-x: auto !important; }
          .fc-timegrid-body { min-width: 600px; } /* Ensures scroll on small screens */
          .fc-timegrid-axis { width: 60px !important; }
        `}
      </style>
      <FullCalendar
        ref={calendarRef}
        schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, resourceTimeGridPlugin]}
        initialView={viewMode}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'resourceTimeGridDay,timeGridWeek,dayGridMonth'
        }}
        views={{
          resourceTimeGridDay: { buttonText: 'Dia (Equipa)' },
          timeGridWeek: { buttonText: 'Semana' },
          dayGridMonth: { buttonText: 'Mês' },
          today: { buttonText: 'Hoje' }
        }}
        locale="pt"
        events={events}
        resources={resources}
        resourceLabelContent={renderResourceLabel}
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
        dayMinWidth={120}
      />
    </div>
  );
}
