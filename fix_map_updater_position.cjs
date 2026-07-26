const fs = require('fs');

let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Undo the bad replacement
home = home.replace(
    '<MapUpdater coordinates={userCoords} />\n                <MapPin className="w-5 h-5" />',
    '<MapPin className="w-5 h-5" />'
);

// Put it in the right place inside APIProvider
home = home.replace(
    '<APIProvider apiKey={API_KEY} language={currentLangCode}> \n                <Map ',
    '<APIProvider apiKey={API_KEY} language={currentLangCode}> \n                <MapUpdater coordinates={userCoords} />\n                <Map '
);

fs.writeFileSync('src/pages/Home.tsx', home);
