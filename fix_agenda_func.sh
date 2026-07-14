sed -i '/const handleUpdateBookingStatus = async/i \
  const handleBusinessCompleteBooking = async () => {\
    if (!selectedBooking) return;\
    setIsUpdatingBooking(true);\
    try {\
      const { error } = await supabase.from("bookings").update({ business_completed: true }).eq("id", selectedBooking.id);\
      if (error) throw error;\
      notifyTerminal("✅ Reserva validada!", "Dupla confirmação aplicada.");\
      setSelectedBooking({ ...selectedBooking, business_completed: true });\
      loadLayoutData();\
    } catch (err) {\
      console.error(err);\
    } finally {\
      setIsUpdatingBooking(false);\
    }\
  };\
' src/pages/partner/tabs/AgendaTab.tsx
