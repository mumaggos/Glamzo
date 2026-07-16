const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const startIndex = content.indexOf('{/* Coupon Creator Interactive Console */}');
const endIndex = content.indexOf('{/* ==================================================== */\n              {/* SECTION 4');

if (startIndex !== -1 && endIndex !== -1) {
  let couponBlock = content.substring(startIndex, endIndex);
  
  // Cut out all trailing closing tags from couponBlock
  couponBlock = couponBlock.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\}\)\s*$/g, '');
  couponBlock = couponBlock.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\}\)\s*$/g, '');
  couponBlock = couponBlock.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\}\)\s*$/g, '');
  couponBlock = couponBlock.replace(/<\/div>\s*<\/div>\s*<\/div>\s*\}\)\s*$/g, '');
  couponBlock = couponBlock.replace(/<\/div>\s*<\/div>\s*\}\)\s*$/g, '');
  couponBlock = couponBlock.replace(/<\/div>\s*\}\)\s*$/g, '');
  couponBlock = couponBlock.replace(/\}\)\s*$/g, '');
  
  // Because we know what Coupon Creator looks like:
  // It has a <div class="bg-white ...">
  // ... <div class="space-y-2 mt-4">
  //     <div class="space-y-1.5 ..."> {couponsList.map...} </div>
  //   </div>
  // </div>
  // So it ends with 3 divs. Let's make sure it ends with exactly 3 divs, then 1 div for the users tab, then )}
  
  // The safest way is to just find the end of the map:
  const mapEndIndex = couponBlock.indexOf('))}');
  if (mapEndIndex !== -1) {
    const cleanCouponBlock = couponBlock.substring(0, mapEndIndex + 3);
    const newEnding = `
                          </div>
                        </div>
                      </div>
                </div>
              )}
              `;
              
    const finalBlock = cleanCouponBlock + newEnding;
    content = content.substring(0, startIndex) + finalBlock + content.substring(endIndex);
    fs.writeFileSync('src/pages/Admin.tsx', content);
    console.log("Fixed cleanly.");
  }
}
