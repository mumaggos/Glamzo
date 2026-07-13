import re

with open("src/pages/Admin.tsx", "r") as f:
    content = f.read()

handler_injection = """  const handleResolveDispute = async (disputeId: string, status: 'resolved' | 'refunded' | 'dismissed') => {
    try {
      const { error } = await supabase
        .from('disputes')
        .update({ status })
        .eq('id', disputeId);
      if (error) throw error;
      setSuccessMsg(`Disputa atualizada para ${status}.`);
      setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status } : d));
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao atualizar disputa.');
    }
  };

  const handleUpdatePayoutStatus"""

content = re.sub(
    r"const handleUpdatePayoutStatus",
    handler_injection,
    content
)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(content)

print("Patched handler")
