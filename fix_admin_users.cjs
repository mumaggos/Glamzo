const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// 1. Remove Glamzo Club tabs
content = content.replace(/.*{ id: 'club', label: 'Glamzo Club & Afiliados', icon: Sparkles },\n/g, "");
content = content.replace(/.*{activeTab === 'club' && <SuperAdminClub \/>}\n/g, "");

// 2. Extract Coupon Creator
const couponBlockRegex = /\{\/\* Coupon Creator Interactive Console \*\/\}[\s\S]*?(?=\{\/\* List of active created promos \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>)/;
// Wait, regex might be tricky. Let's find the indices.
const startStr = "{/* Coupon Creator Interactive Console */}";
const endStr = "</div>\n                    </div>"; // End of Payouts column 2.

const startIndex = content.indexOf(startStr);
const endPayoutsColumn2 = content.indexOf("</div>\n                    </div>\n                  </div>\n                </div>\n              )}", startIndex);

const couponHTML = content.substring(startIndex, endPayoutsColumn2);

// Remove couponHTML from its current location
content = content.replace(couponHTML, "");

// Append couponHTML to the end of users tab
const usersTabEnd = "</div>\n                  </div>\n                </div>\n              )}";
const usersTabIndex = content.indexOf(usersTabEnd, content.indexOf("{activeTab === 'users' && ("));

if(usersTabIndex !== -1) {
    const insertHTML = "</div>\n                  </div>\n\n                  " + couponHTML + "\n                </div>\n              )}";
    content = content.replace(content.substring(usersTabIndex, usersTabIndex + usersTabEnd.length), insertHTML);
}

fs.writeFileSync('src/pages/Admin.tsx', content);
console.log("Admin.tsx updated for users/coupons/club.");
