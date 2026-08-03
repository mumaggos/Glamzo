const fs = require('fs');
let metadata = JSON.parse(fs.readFileSync('metadata.json', 'utf8'));
if (!metadata.requestFramePermissions.includes('geolocation')) {
  metadata.requestFramePermissions.push('geolocation');
}
fs.writeFileSync('metadata.json', JSON.stringify(metadata, null, 2));
