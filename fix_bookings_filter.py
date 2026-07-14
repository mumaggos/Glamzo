with open("src/pages/Account.tsx", "r") as f:
    text = f.read()

filter_logic = """
  const filteredBookings = bookings.filter(bk => {
    if (dateFilter === 'todos') return true;
    
    const bkDate = new Date(bk.booking_date);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (dateFilter === 'hoje') {
      const bDate = new Date(bkDate);
      bDate.setHours(0,0,0,0);
      return bDate.getTime() === today.getTime();
    }
    
    if (dateFilter === 'semana') {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return bkDate >= today && bkDate <= nextWeek;
    }
    
    if (dateFilter === 'mes') {
      return bkDate.getMonth() === today.getMonth() && bkDate.getFullYear() === today.getFullYear();
    }
    
    if (dateFilter === 'intervalo' && customDate) {
      const cDate = new Date(customDate);
      cDate.setHours(0,0,0,0);
      const bDate = new Date(bkDate);
      bDate.setHours(0,0,0,0);
      return bDate.getTime() === cDate.getTime();
    }
    
    return dateFilter === 'intervalo' && !customDate ? true : false;
  });

"""

text = text.replace("  return (\n    <div id=\"account-view\"", filter_logic + "  return (\n    <div id=\"account-view\"")

with open("src/pages/Account.tsx", "w") as f:
    f.write(text)
