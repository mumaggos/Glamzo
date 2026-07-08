const fs = require('fs');
let content = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

const regex = /const currentAvailable = getAvailableSlots\(\);\n      const matchedSlot = currentAvailable\.find\(s => s\.start === selectedTime\);/;

const replacement = `
      // Refetch bookings to ensure slot is still available
      const { data: freshBookings } = await supabase
        .from('bookings')
        .select('id, staff_id, booking_date, start_time, end_time, booking_status')
        .eq('business_id', business.id)
        .neq('booking_status', 'cancelled');
        
      const currentBookings = freshBookings || [];
      const dateStrForCheck = [selectedDate.getFullYear(), String(selectedDate.getMonth() + 1).padStart(2, '0'), String(selectedDate.getDate()).padStart(2, '0')].join('-');
      const bookingsTodayCheck = currentBookings.filter(b => b.booking_date === dateStrForCheck);
      
      const checkOverlapFresh = (b: any, sId?: string) => {
        const slotStart = timeToMinutes(selectedTime);
        const slotEnd = slotStart + totalServicesDuration;
        const bStart = timeToMinutes(b.start_time);
        const bEnd = timeToMinutes(b.end_time);
        const overlapsTime = slotStart < bEnd && bStart < slotEnd;
        if (!overlapsTime) return false;
        if (b.staff_id === null) return true;
        if (sId && b.staff_id !== sId) return false;
        return true;
      };

      let finalStaffIdForBooking = null;
      let isAvailableNow = false;

      if (staff.length === 0) {
        if (!bookingsTodayCheck.some(b => checkOverlapFresh(b))) isAvailableNow = true;
      } else {
        if (selectedStaff === 'any') {
          const availableStaff = staff.filter(s => {
            if (s.off_days && s.off_days.split(',').map(Number).includes(selectedDate.getDay())) return false;
            return !bookingsTodayCheck.some(b => checkOverlapFresh(b, s.id));
          });
          if (availableStaff.length > 0) {
            isAvailableNow = true;
            finalStaffIdForBooking = availableStaff[0].id;
          }
        } else {
          if (!bookingsTodayCheck.some(b => checkOverlapFresh(b, selectedStaff.id))) {
            isAvailableNow = true;
            finalStaffIdForBooking = selectedStaff.id;
          }
        }
      }

      if (!isAvailableNow) throw new Error('Este horário acabou de ser reservado ou bloqueado. Por favor, escolha outra hora.');
      
      const currentAvailable = getAvailableSlots();
      const matchedSlot = currentAvailable.find(s => s.start === selectedTime);
`;

content = content.replace(regex, replacement);

const staffIdRegex = /const finalStaffId = selectedStaff === 'any' \? matchedSlot\.assignedStaffId : selectedStaff\.id;/;
content = content.replace(staffIdRegex, `const finalStaffId = selectedStaff === 'any' ? (finalStaffIdForBooking || matchedSlot?.assignedStaffId) : selectedStaff.id;`);

fs.writeFileSync('src/components/BookingModal.tsx', content);

