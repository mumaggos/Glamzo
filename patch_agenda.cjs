const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf8');

if (!content.includes('const [isProcessingTerminal')) {
  content = content.replace(
    'const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);',
    'const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);\n  const [isProcessingTerminal, setIsProcessingTerminal] = useState(false);'
  );
}

const functionToAdd = `
  const handleStripeTerminalPayment = async () => {
    if (!selectedBooking) return;
    setIsProcessingTerminal(true);
    try {
      const res = await fetch("/api/stripe/terminal/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          bookingId: selectedBooking.id, 
          businessId: business?.id,
          amount: selectedBooking.service?.price
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao comunicar com o terminal. Certifique-se que o leitor está ligado.');
      
      setToastNotification({
        visible: true,
        title: "Pagamento Concluído",
        desc: "O pagamento foi processado com sucesso no terminal físico."
      });
      
      setIsPaymentModalOpen(false);
      setTimeout(() => setSelectedBooking(null), 1500);
      loadLayoutData();
    } catch (e: any) {
      alert("Falha: " + e.message);
    } finally {
      setIsProcessingTerminal(false);
    }
  };
`;

if (!content.includes('handleStripeTerminalPayment')) {
  content = content.replace(
    'const handleUpdateBookingStatus = async (status: string) => {',
    functionToAdd + '\n  const handleUpdateBookingStatus = async (status: string) => {'
  );
}

content = content.replace(
  "onClick={() => console.log('Iniciar Fluxo Capacitor Stripe Terminal')} className=\"w-full flex items-center gap-4 p-5 rounded-xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50 transition-all text-left\"",
  "onClick={handleStripeTerminalPayment} disabled={isProcessingTerminal} className=\"w-full flex items-center gap-4 p-5 rounded-xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50 transition-all text-left disabled:opacity-50\""
);

content = content.replace(
  "{t('agenda.physicalTerminalBtn')}",
  "{isProcessingTerminal ? 'A processar no leitor...' : t('agenda.physicalTerminalBtn')}"
);

fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', content);
console.log("AgendaTab updated");
