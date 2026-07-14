with open("src/pages/partner/tabs/AgendaTab.tsx", "r") as f:
    text = f.read()

if "import toast from 'react-hot-toast'" not in text:
    text = text.replace("import { supabase }", "import toast from 'react-hot-toast';\nimport { supabase }")

target = """      const { error } = await supabase.from('disputes').insert({
        booking_id: selectedBooking.id,
        business_id: business.id,
        user_id: business.owner_id,
        title: disputeReason,
        reason: `${disputeReason} - ${disputeDescription}`
      });
      if (error) throw error;
      setDisputeModalOpen(false);
      notifyTerminal("🚨 Disputa", "A sua queixa foi registada.");
    } catch (err: any) {
      alert(err.message || "Erro ao abrir disputa.");
    } finally {
      setSubmittingDispute(false);
    }
  };"""

replacement = """      const { error } = await supabase.from('disputes').insert({
        booking_id: selectedBooking.id,
        business_id: business.id,
        user_id: business.owner_id,
        title: disputeReason,
        reason: `${disputeReason} - ${disputeDescription}`,
        status: 'open'
      });
      if (error) throw error;
      toast.success('Queixa registada com sucesso. A equipa vai analisar.');
      setDisputeReason('');
      setDisputeDescription('');
      setDisputeModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao abrir disputa.");
    } finally {
      setSubmittingDispute(false);
    }
  };"""

text = text.replace(target, replacement)

with open("src/pages/partner/tabs/AgendaTab.tsx", "w") as f:
    f.write(text)
