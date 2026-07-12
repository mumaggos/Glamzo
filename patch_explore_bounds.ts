import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

const searchBounds = `// Bounds filtering
    if (mapBounds) {
      const lat = b.lat;
      const lng = b.lng;
      if (lat < mapBounds.south || lat > mapBounds.north || lng < mapBounds.west || lng > mapBounds.east) {
        return false;
      }
    } else if (useNearMe && userCoords && b.distance !== null) {
      // fallback to radius if no map bounds
      if (b.distance > 50) return false; // expanded default to 50km
    }`;

const replaceBounds = `// Bounds filtering
    if (searchRadius !== null) {
      if (mapBounds) {
        const lat = b.lat;
        const lng = b.lng;
        if (lat < mapBounds.south || lat > mapBounds.north || lng < mapBounds.west || lng > mapBounds.east) {
          return false;
        }
      } else if (useNearMe && userCoords && b.distance !== null) {
        // fallback to radius if no map bounds
        if (b.distance > 50) return false; // expanded default to 50km
      }
    }`;

content = content.replace(searchBounds, replaceBounds);

fs.writeFileSync('src/pages/Explore.tsx', content);
