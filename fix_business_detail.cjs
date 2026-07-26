const fs = require('fs');
let detail = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8');

const directionsOld = `                  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
                  const directionsUrl = hasCoords
                    ? (isIOS ? \`maps://?daddr=\${business.latitude},\${business.longitude}\` : \`https://www.google.com/maps/dir/?api=1&destination=\${business.latitude},\${business.longitude}\`)
                    : \`https://www.google.com/maps/dir/?api=1&destination=\${encodeURIComponent(fullAddress)}\`;`;

const directionsNew = `                  const directionsUrl = hasCoords
                    ? \`https://www.google.com/maps/dir/?api=1&destination=\${business.latitude},\${business.longitude}\`
                    : \`https://www.google.com/maps/dir/?api=1&destination=\${encodeURIComponent(fullAddress)}\`;`;

detail = detail.replace(directionsOld, directionsNew);
fs.writeFileSync('src/pages/BusinessDetail.tsx', detail);
console.log("Updated BusinessDetail.tsx directionsUrl");
