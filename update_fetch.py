import re

with open("src/pages/Account.tsx", "r") as f:
    text = f.read()

# Add processBookingPoints import
if "processBookingPoints" not in text:
    text = text.replace("import { submitSupportQuery", "import { processBookingPoints } from '../utils/rewardsHelper';\nimport { submitSupportQuery")

# Update fetchUserBookings to process points for completed bookings
fetch_target = r"""      setBookings\(data \|\| \[\]\);
    \} catch \(err: any\) \{ setBookingError\('Falha ao recuperar reservas\.'\); \} finally \{ setLoadingBookings\(false\); \}"""
fetch_replacement = """      setBookings(data || []);
      // Auto-process points for fully completed bookings
      if (data) {
        data.forEach(b => processBookingPoints(b));
      }
    } catch (err: any) { setBookingError('Falha ao recuperar reservas.'); } finally { setLoadingBookings(false); }"""
text = re.sub(fetch_target, fetch_replacement, text)

# Update handleClientCompleteBooking
client_comp_target = r"""      setBookings\(prev => prev\.map\(b => b\.id === bookingId \? \{ \.\.\.b, client_completed: true \} : b\)\);
      toast\.success\('Reserva marcada como concluída!'\);"""
client_comp_replacement = """      setBookings(prev => {
        const newBookings = prev.map(b => b.id === bookingId ? { ...b, client_completed: true } : b);
        const completedBooking = newBookings.find(b => b.id === bookingId);
        if (completedBooking) processBookingPoints(completedBooking);
        return newBookings;
      });
      toast.success('Reserva marcada como concluída!');"""
text = re.sub(client_comp_target, client_comp_replacement, text)

with open("src/pages/Account.tsx", "w") as f:
    f.write(text)
