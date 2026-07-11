import fs from 'fs';
let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

const targetHandleBooking = `  const handleOpenBooking = (service: any | null) => {
    if (!user) {
      if (service) sessionStorage.setItem('pre_selected_service_id', service.id);
      localStorage.setItem('returnTo', location.pathname + location.search);
      if (business?.id) {
        localStorage.setItem('pendingFavoriteShopId', business.id);
      }
      // Aqui dizemos ao Login para devolver à Loja!
      navigate(\`/login?redirect=\${encodeURIComponent(location.pathname)}\`);
      return;
    }
    setSelectedService(service || null);
    setBookingOpen(true);
  };`;

const replacementHandleBooking = `  const handleOpenBooking = (service: any | null) => {
    if (!user) {
      if (service) sessionStorage.setItem('pre_selected_service_id', service.id);
      localStorage.setItem('returnTo', location.pathname + location.search);
      if (business?.id) {
        localStorage.setItem('pendingFavoriteShopId', business.id);
      }
      navigate(\`/login\`);
      return;
    }
    setSelectedService(service || null);
    setBookingOpen(true);
  };`;

content = content.replace(targetHandleBooking, replacementHandleBooking);
fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
