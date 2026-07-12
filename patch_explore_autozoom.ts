import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

const searchEffect = `useEffect(() => {
    if (userCoords) {
      setMapCenter({ lat: userCoords.latitude, lng: userCoords.longitude });
      if (searchRadius === null) setMapZoom(6);
      else if (searchRadius <= 5) setMapZoom(12);
      else if (searchRadius <= 10) setMapZoom(11);
      else if (searchRadius <= 25) setMapZoom(10);
      else if (searchRadius <= 50) setMapZoom(9);
    }
  }, [searchRadius, userCoords]);`;

const replaceEffect = `useEffect(() => {
    if (searchRadius === null && businesses.length > 0) {
      const lats = businesses.map(b => b.latitude ?? getCoordinatesForCity(b.district, b.city).latitude).filter(l => l !== undefined && l !== null);
      const lngs = businesses.map(b => b.longitude ?? getCoordinatesForCity(b.district, b.city).longitude).filter(l => l !== undefined && l !== null);
      if (lats.length > 0 && lngs.length > 0) {
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;
        
        const maxDiff = Math.max(maxLat - minLat, maxLng - minLng);
        let zoom = 6;
        if (maxDiff < 0.05) zoom = 13;
        else if (maxDiff < 0.1) zoom = 12;
        else if (maxDiff < 0.5) zoom = 11;
        else if (maxDiff < 1) zoom = 9;
        else if (maxDiff < 2) zoom = 8;
        else if (maxDiff < 5) zoom = 7;
        
        setMapCenter({ lat: centerLat, lng: centerLng });
        setMapZoom(zoom);
      } else if (userCoords) {
        setMapCenter({ lat: userCoords.latitude, lng: userCoords.longitude });
        setMapZoom(6);
      }
    } else if (searchRadius !== null && userCoords) {
      setMapCenter({ lat: userCoords.latitude, lng: userCoords.longitude });
      if (searchRadius <= 5) setMapZoom(12);
      else if (searchRadius <= 10) setMapZoom(11);
      else if (searchRadius <= 25) setMapZoom(10);
      else if (searchRadius <= 50) setMapZoom(9);
    }
  }, [searchRadius, userCoords, businesses]);`;

content = content.replace(searchEffect, replaceEffect);
fs.writeFileSync('src/pages/Explore.tsx', content);
