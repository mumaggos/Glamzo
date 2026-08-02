const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(
  /           const lat = b.latitude \?\? getCoordinatesForCity\(b.district, b.city\).latitude;\n           const lng = b.longitude \?\? getCoordinatesForCity\(b.district, b.city\).longitude;/g,
  `           const coords = (b.latitude && b.longitude) ? { latitude: b.latitude, longitude: b.longitude } : getCoordinatesForCity(b.district, b.city);
           const lat = coords.latitude;
           const lng = coords.longitude;`
);

fs.writeFileSync('src/pages/Home.tsx', code);
