const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf8');

text = text.replace(
`    const enforceSeparation = async () => {
       if (profile.role === 'business' || profile.role === 'staff' || profile.role === 'admin') {
          // Se uma loja/staff/admin vai para o site publico (home, explore, etc), fazer logout
          if (isPublicCustomerRoute) {
             console.log("Forcing logout: Staff/Business accessing public customer route", path);
             await signOut();
          }
       } else if (profile.role === 'customer') {
          // Se um cliente vai para a área de lojas/staff, fazer logout para permitir login de loja
          if ((isPartnerRoute && path !== '/partner') || isStaffRoute || isAdminRoute) {
             console.log("Forcing logout: Customer accessing business/staff route", path);
             await signOut();
          }
       }
    };`,
`    const enforceSeparation = async () => {
       if (profile.role === 'business') {
          if (isPublicCustomerRoute || isStaffRoute || isAdminRoute) {
             console.log("Redirecting business to their dashboard instead of logout", path);
             window.location.href = '/partner/dashboard';
          }
       } else if (profile.role === 'staff') {
          if (isPublicCustomerRoute || isPartnerRoute || isAdminRoute) {
             console.log("Redirecting staff to their dashboard instead of logout", path);
             window.location.href = '/staff/dashboard';
          }
       } else if (profile.role === 'admin') {
          if (isPublicCustomerRoute || isPartnerRoute || isStaffRoute) {
             console.log("Redirecting admin to their dashboard instead of logout", path);
             window.location.href = '/admin';
          }
       } else if (profile.role === 'customer') {
          if ((isPartnerRoute && path !== '/partner') || isStaffRoute || isAdminRoute) {
             console.log("Forcing logout: Customer accessing business/staff route", path);
             await signOut();
          }
       }
    };`
);

fs.writeFileSync('src/App.tsx', text);
