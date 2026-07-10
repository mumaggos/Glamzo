import fs from 'fs';
let code = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

if (!code.includes('api/business/qr-scan')) {
  code = code.replace(
    'useEffect(() => {',
    `useEffect(() => {
    if (business?.id) {
      // Track page view
      fetch('/api/business/qr-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business.id })
      }).catch(console.error);
    }
  }, [business?.id]);

  useEffect(() => {`
  );
  fs.writeFileSync('src/pages/BusinessDetail.tsx', code);
}
