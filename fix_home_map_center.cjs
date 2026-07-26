const fs = require('fs');

let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');

if (home.includes('defaultCenter={userCoords')) {
    home = home.replace(
        'defaultCenter={userCoords ? { lat: userCoords.lat, lng: userCoords.lng } : { lat: 38.7223, lng: -9.1393 }}',
        'center={userCoords ? { lat: userCoords.lat, lng: userCoords.lng } : { lat: 38.7223, lng: -9.1393 }}'
    );
    home = home.replace(
        'defaultZoom={userCoords ? 13 : 8}',
        'zoom={userCoords ? 13 : 8}'
    );
    fs.writeFileSync('src/pages/Home.tsx', home);
    console.log("Updated Home map props to center/zoom");
} else {
    console.log("Could not find defaultCenter in Home.tsx");
}
