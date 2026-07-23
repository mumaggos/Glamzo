const fs = require('fs');
let content = fs.readFileSync('src/contexts/DevOverrideContext.tsx', 'utf8');

content = content.replace(
    /success\(\{[\s\S]*?timestamp: Date.now\(\),[\s\S]*?\}\);/m,
    `success({
            coords: {
              latitude: overrideLocation.lat,
              longitude: overrideLocation.lng,
              accuracy: 100,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
              toJSON: () => ({})
            },
            timestamp: Date.now(),
            toJSON: () => ({})
          } as GeolocationPosition);`
);

fs.writeFileSync('src/contexts/DevOverrideContext.tsx', content);
