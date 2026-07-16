const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// 1. Add 'coupons' to desktop sidebar
const desktopSidebarOld = `              {[
                { id: 'users', label: 'Clientes Finais (CRM)', icon: Users },
                { id: 'funnel', label: 'Funil & Abandonos ⚠️', icon: BadgeAlert },`;
const desktopSidebarNew = `              {[
                { id: 'users', label: 'Clientes Finais (CRM)', icon: Users },
                { id: 'coupons', label: 'Cupões', icon: Tag },
                { id: 'funnel', label: 'Funil & Abandonos ⚠️', icon: BadgeAlert },`;
content = content.replace(desktopSidebarOld, desktopSidebarNew);

// 2. Add 'coupons' to mobile sidebar
const mobileSidebarOld = `                {[
                  { id: 'users', label: 'Clientes Finais (CRM)', icon: Users },
                  { id: 'funnel', label: 'Funil & Abandonos ⚠️', icon: BadgeAlert },`;
const mobileSidebarNew = `                {[
                  { id: 'users', label: 'Clientes Finais (CRM)', icon: Users },
                  { id: 'coupons', label: 'Cupões', icon: Tag },
                  { id: 'funnel', label: 'Funil & Abandonos ⚠️', icon: BadgeAlert },`;
content = content.replace(mobileSidebarOld, mobileSidebarNew);

// 3. Extract Coupon section from users tab
const couponSectionRegex = /                  \{\/\* Coupon Creator Interactive Console \*\/\}[\s\S]*?                  <\/div>\n/;
const couponMatch = content.match(couponSectionRegex);

if (couponMatch) {
  content = content.replace(couponMatch[0], "");
  
  // Create the new tab content
  const newTab = `
              {activeTab === 'coupons' && (
                <div id="admin-coupons" className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-fuchsia-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <Tag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-800 tracking-tight">Gestão de Cupões</h2>
                      <p className="text-xs font-bold text-slate-500">Crie códigos promocionais globais</p>
                    </div>
                  </div>
${couponMatch[0]}
                </div>
              )}
`;
  
  // Insert new tab before the first activeTab (e.g. users)
  content = content.replace("{activeTab === 'users' && (", newTab + "\n              {activeTab === 'users' && (");
}

fs.writeFileSync('src/pages/Admin.tsx', content);
console.log('Fixed Admin Coupons');
