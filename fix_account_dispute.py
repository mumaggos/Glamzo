with open("src/pages/Account.tsx", "r") as f:
    text = f.read()

# Add react-hot-toast import if missing
if "import toast from 'react-hot-toast'" not in text:
    text = text.replace("import { useAuth }", "import toast from 'react-hot-toast';\nimport { useAuth }")

# Update dispute submit
target = """      const { error } = await supabase.from('disputes').insert({
        booking_id: disputeBooking.id,
        user_id: user.id,
        business_id: disputeBooking.business_id,
        title: disputeReason,
        reason: `${disputeReason}
${disputeDescription}`
      });
      if (error) throw error;
      setRedeemSuccess(`🚨 Reclamação registada. A equipa Glamzo abriu uma disputa. Analisaremos em 24h.`);
    } catch (err: any) {
      setBookingError(err.message || 'Erro ao abrir disputa');
    } finally {
      setDisputeModalOpen(false); 
      setSubmittingDispute(false);
    }
  };"""

replacement = """      const { error } = await supabase.from('disputes').insert({
        booking_id: disputeBooking.id,
        user_id: user.id,
        business_id: disputeBooking.business_id,
        title: disputeReason,
        reason: `${disputeReason}\\n${disputeDescription}`,
        status: 'open'
      });
      if (error) throw error;
      toast.success('Queixa registada com sucesso. A equipa vai analisar.');
      setDisputeReason('');
      setDisputeDescription('');
      setDisputeModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao abrir disputa');
    } finally {
      setSubmittingDispute(false);
    }
  };"""

text = text.replace(target, replacement)

# We should also fetch the unread messages count and pending disputes count to display in badges
with open("src/pages/Account.tsx", "w") as f:
    f.write(text)
