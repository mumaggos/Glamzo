const fs = require('fs');
let text = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

text = text.replace(
`      if (billsData && billsData.length > 0) {
        setPaymentsList(billsData);
      } else {
        // High-fidelity active transactions so admin charts and KPIs are populated beautifully
        const seedPayments = [
          { id: 'p-01', amount: 45.00, created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
          { id: 'p-02', amount: 85.00, created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
          { id: 'p-03', amount: 120.00, created_at: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString() },
          { id: 'p-04', amount: 35.00, created_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString() },
          { id: 'p-05', amount: 155.00, created_at: new Date(Date.now() - 17 * 24 * 3600 * 1000).toISOString() },
          { id: 'p-06', amount: 75.00, created_at: new Date(Date.now() - 21 * 24 * 3600 * 1000).toISOString() },
          { id: 'p-07', amount: 210.00, created_at: new Date(Date.now() - 26 * 24 * 3600 * 1000).toISOString() }
        ];
        setPaymentsList(seedPayments);
      }`,
`      if (billsData && billsData.length > 0) {
        setPaymentsList(billsData);
      } else {
        setPaymentsList([]);
      }`
);

text = text.replace(
`      try {
        const realTickets = await fetchSupportTickets();
        const mockTickets = [
          { id: 'tc-801', customer_name: 'Parceiro Luxe Nails', business_name: 'Luxe Nails Porto', status: 'open', priority: 'high', description: 'Integração de Contas Stripe Connect falhou no checkout', created_at: new Date().toISOString() },
          { id: 'tc-802', customer_name: 'Comerciante Barbearia', business_name: 'Barbearia da Linha', status: 'open', priority: 'medium', description: 'Não recebi o envio CTT de entrega do Tablet Terminal comodato', created_at: new Date().toISOString() }
        ];
        // Merge real and mock tickets safely
        const combined = [
          ...realTickets.map(t => ({
            id: t.id,
            customer_name: t.customer_name,
            business_name: t.business_name || 'Geral',
            status: t.status,
            priority: t.priority,
            description: t.description,
            created_at: t.created_at
          })), 
          ...mockTickets.filter(mt => !realTickets.some(rt => rt.id === mt.id))
        ];
        setTickets(combined);
      } catch (_) {}`,
`      try {
        const realTickets = await fetchSupportTickets();
        const combined = realTickets.map(t => ({
            id: t.id,
            customer_name: t.customer_name,
            business_name: t.business_name || 'Geral',
            status: t.status,
            priority: t.priority,
            description: t.description,
            created_at: t.created_at
          }));
        setTickets(combined);
      } catch (_) {}`
);

fs.writeFileSync('src/pages/Admin.tsx', text);
