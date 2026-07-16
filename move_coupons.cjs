const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// 1. Remove coupons tab from menus
code = code.replace("{ id: 'coupons', label: 'Cupões', icon: Tag },", "");
code = code.replace("{ id: 'coupons', label: 'Cupões', icon: Tag },", ""); // in case there's two

// 2. Extract the Coupon Generator div block
// Wait, I will use regex or find to extract
const startTag = '{activeTab === \'coupons\' && (';
const couponsSectionStart = code.indexOf(startTag);
if (couponsSectionStart > -1) {
  const couponsEndPattern = '</div>\n              )}';
  let couponsSectionEnd = code.indexOf(couponsEndPattern, couponsSectionStart);
  if (couponsSectionEnd > -1) {
    const couponsSectionCompleteEnd = couponsSectionEnd + couponsEndPattern.length;
    let couponsContent = code.substring(couponsSectionStart, couponsSectionCompleteEnd);
    
    // the inner div is what we want:
    const startInner = couponsContent.indexOf('<!-- COUPON GENERATOR -->'); // wait, I don't have this.
    // Let's find: <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
    const innerStart = couponsContent.indexOf('<div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">');
    const innerEnd = couponsContent.lastIndexOf('</div>\n                  </div>\n                </div>');
    
    if (innerStart > -1 && innerEnd > -1) {
      let couponGeneratorCode = couponsContent.substring(innerStart, innerEnd + 6); 
      // replace the whole coupons section with empty
      code = code.substring(0, couponsSectionStart) + code.substring(couponsSectionCompleteEnd);
      
      // now find users tab
      const usersTabPattern = '{activeTab === \'users\' && (\n                <div id="admin-users" className="space-y-6">';
      const usersTabStart = code.indexOf(usersTabPattern);
      if (usersTabStart > -1) {
        code = code.substring(0, usersTabStart + usersTabPattern.length) + 
               '\n                  {/* Coupon Generator Migrated */}\n                  ' + couponGeneratorCode + 
               code.substring(usersTabStart + usersTabPattern.length);
      }
    }
  }
}
fs.writeFileSync('src/pages/Admin.tsx', code);
