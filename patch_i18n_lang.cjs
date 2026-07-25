const fs = require('fs');

let content = fs.readFileSync('src/i18n.ts', 'utf8');

// EN
content = content.replace(/"feat2Title": "Exclusive Marketplace",/g, '"feat2Title": "Glamzo Pay",');
content = content.replace(/"feat2Desc": "Get discovered by thousands of clients in your area. Google-optimized webpage.",/g, '"feat2Desc": "End fake cancellations. Charge for online services with Apple Pay, Google Pay, and Cards directly on the platform.",');

content = content.replace(/"feat3Title": "No-Show Protection",/g, '"feat3Title": "Marketing & Vouchers",');
content = content.replace(/"feat3Desc": "Automatic deposit collection and cancellation policies that protect your time.",/g, '"feat3Desc": "Create discount coupons to attract clients on slow days and build a solid loyalty network.",');

// ES
content = content.replace(/"feat2Title": "Marketplace Exclusivo",/g, '"feat2Title": "Glamzo Pay",');
content = content.replace(/"feat2Desc": "Sé descubierto por miles de clientes en tu zona. Página web optimizada para Google.",/g, '"feat2Desc": "Fin a las cancelaciones falsas. Cobra servicios online con Apple Pay, Google Pay y Tarjetas directamente en la plataforma.",');

content = content.replace(/"feat3Title": "Protección Anti-Inasistencias",/g, '"feat3Title": "Marketing y Cupones",');
content = content.replace(/"feat3Desc": "Cobro de depósitos automáticos y políticas de cancelación que protegen tu tiempo.",/g, '"feat3Desc": "Crea cupones de descuento para atraer clientes en días lentos y construye una sólida red de fidelización.",');

// FR
content = content.replace(/"feat2Title": "Marketplace Exclusif",/g, '"feat2Title": "Glamzo Pay",');
content = content.replace(/"feat2Desc": "Soyez découvert par des milliers de clients dans votre région. Page web optimisée pour Google.",/g, '"feat2Desc": "Fini les fausses annulations. Facturez les services en ligne avec Apple Pay, Google Pay et Cartes directement sur la plateforme.",');

content = content.replace(/"feat3Title": "Protection Anti-Absences",/g, '"feat3Title": "Marketing et Bons",');
content = content.replace(/"feat3Desc": "Collecte d'acomptes automatiques et politiques d'annulation qui protègent votre temps.",/g, '"feat3Desc": "Créez des coupons de réduction pour attirer des clients les jours calmes et bâtissez un solide réseau de fidélisation.",');

fs.writeFileSync('src/i18n.ts', content);
console.log('Patched i18n languages');
