const fs = require('fs');
let text = fs.readFileSync('src/utils/financeService.ts', 'utf8');

text = text.replace(
`  if (!list) {
    // Seed default payouts
    const initial: PartnerPayout[] = [
      {
        id: 'PAY_FR456',
        business_id: 'b_1',
        business_name: 'Barbearia D’Elite',
        amount: 320.50,
        method: 'transfer',
        destination_details: 'PT50 0003 0456 1234 5678 9012 34',
        status: 'pago',
        created_at: '2026-05-12T14:20:00Z',
        paid_at: '2026-05-15T09:00:00Z',
        expected_date: '2026-05-15T09:00:00Z'
      }
    ];
    localStorage.setItem('glamzo_payouts', JSON.stringify(initial));
    return initial;
  }`,
`  if (!list) {
    localStorage.setItem('glamzo_payouts', JSON.stringify([]));
    return [];
  }`
);

fs.writeFileSync('src/utils/financeService.ts', text);
