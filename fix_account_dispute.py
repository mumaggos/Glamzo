import re

with open("src/pages/Account.tsx", "r") as f:
    content = f.read()

# Remove the duplicate `handleOpenDispute` that I added.
content = re.sub(
    r"\s+const handleOpenDispute = async \(bookingId: string, businessId: string\) => \{.*?\};\n",
    "\n",
    content,
    flags=re.DOTALL
)

# Also replace the button call back to its original
content = re.sub(
    r"onClick=\{.*?handleOpenDispute\(bk\.id, bk\.business_id\).*?\}",
    "onClick={() => handleOpenDispute(bk)}",
    content,
    flags=re.DOTALL
)

# Update `handleSubmitDispute`
new_submit = """  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !disputeBooking) return;
    setSubmittingDispute(true);
    
    try {
      const { error } = await supabase.from('disputes').insert({
        booking_id: disputeBooking.id,
        initiator_id: user.id,
        business_id: disputeBooking.business_id,
        reason: `${disputeReason}\\n${disputeDescription}`
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

content = re.sub(
    r"const handleSubmitDispute =.*?setSubmittingDispute\(false\);\s+\};",
    new_submit,
    content,
    flags=re.DOTALL
)

with open("src/pages/Account.tsx", "w") as f:
    f.write(content)
