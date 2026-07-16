const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const startIndex = content.indexOf('{/* Coupon Creator Interactive Console */}');
const endIndex = content.indexOf('{activeTab === \'support\' && (');

if (startIndex !== -1 && endIndex !== -1) {
  let couponBlock = content.substring(startIndex, endIndex);
  
  const mapEndIndex = couponBlock.indexOf('))}');
  if (mapEndIndex !== -1) {
    const cleanCouponBlock = couponBlock.substring(0, mapEndIndex + 3);
    const newEnding = `
                          </div>
                        </div>
                      </div>
                </div>
              )}
              {/* ==================================================== */}
              {/* SECTION 4: DISPUTAS & TICKETS DE SUPORTE             */}
              {/* ==================================================== */}
              `;
              
    const finalBlock = cleanCouponBlock + newEnding;
    content = content.substring(0, startIndex) + finalBlock + content.substring(endIndex);
    fs.writeFileSync('src/pages/Admin.tsx', content);
    console.log("Fixed cleanly 2.");
  }
}
