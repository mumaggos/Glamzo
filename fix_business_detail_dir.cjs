const fs = require('fs');

let detail = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8');

const detailOld = `                  const directionsUrl = hasCoords
                    ? \`https://www.google.com/maps/dir/?api=1&destination=\${business.latitude},\${business.longitude}\`
                    : \`https://www.google.com/maps/dir/?api=1&destination=\${encodeURIComponent(fullAddress)}\`;`;

const detailNew = `                  const directionsUrl = hasCoords
                    ? \`https://www.google.com/maps/dir/?api=1&destination=\${business.latitude},\${business.longitude}\`
                    : \`https://www.google.com/maps/dir/?api=1&destination=\${encodeURIComponent(fullAddress)}\`;`;

if (detail.includes(detailOld)) {
    // Already correct, wait, maybe they mean clicking it inside the platform doesn't work.
}

