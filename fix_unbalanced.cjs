const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// I will find the exact block and replace it with properly balanced tags.
const regex = /\{\/\* Coupon Creator Interactive Console \*\/\}[\s\S]*?\}\)/;
const match = content.match(regex);

if (match) {
  let block = match[0];
  // the block ends with })\n
  // Let's replace the ending with the correct tags.
  // The coupon block itself needs 1 div to close.
  // Then the users tab needs 1 div to close.
  // So after the list of coupons, there should be:
  const newEnding = `
                        </div>
                      </div>
                </div>
              )}`;
  
  // Replace from the last map to the end
  block = block.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\}\)/, newEnding);
  content = content.replace(match[0], block);
  fs.writeFileSync('src/pages/Admin.tsx', content);
  console.log("Fixed unbalanced tags.");
}
