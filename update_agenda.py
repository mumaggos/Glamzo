import re

with open("src/pages/partner/tabs/AgendaTab.tsx", "r") as f:
    text = f.read()

# Add processBookingPoints import
if "processBookingPoints" not in text:
    text = text.replace("import { CheckCircle,", "import { processBookingPoints } from '../../../utils/rewardsHelper';\nimport { CheckCircle,")

# Update handleBusinessCompleteBooking
target = r"""      notifyTerminal\("✅ Reserva validada!", "Dupla confirmação aplicada\."\);
      setSelectedBooking\(\{ \.\.\.selectedBooking, business_completed: true \}\);
      loadLayoutData\(\);"""
replacement = """      notifyTerminal("✅ Reserva validada!", "Dupla confirmação aplicada.");
      const updatedBooking = { ...selectedBooking, business_completed: true };
      setSelectedBooking(updatedBooking);
      processBookingPoints(updatedBooking);
      loadLayoutData();"""
text = re.sub(target, replacement, text)

# We should also process points when fetching bookings
fetch_target = r"""      setBookings\(data \|\| \[\]\);
    \} catch \(err\) \{"""
fetch_replacement = """      setBookings(data || []);
      if (data) {
        data.forEach(b => processBookingPoints(b));
      }
    } catch (err) {"""
text = re.sub(fetch_target, fetch_replacement, text)

with open("src/pages/partner/tabs/AgendaTab.tsx", "w") as f:
    f.write(text)
