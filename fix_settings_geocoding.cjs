const fs = require('fs');

let settingsTab = fs.readFileSync('src/pages/partner/tabs/SettingsTab.tsx', 'utf8');

const triggerGeocodingStr = `
  const triggerGeocoding = async () => {
    if (!formData.address || !formData.city) return;
    try {
      const fullAddress = \`\${formData.address} \${formData.door_number ? formData.door_number + ',' : ''} \${formData.postal_code} \${formData.city}, Portugal\`;
      let lat = null;
      let lng = null;
      
      if (API_KEY) {
        const res = await fetch(\`https://maps.googleapis.com/maps/api/geocode/json?address=\${encodeURIComponent(fullAddress)}&key=\${API_KEY}\`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          lat = data.results[0].geometry.location.lat;
          lng = data.results[0].geometry.location.lng;
        }
      } else {
        const res = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(fullAddress)}\`);
        const data = await res.json();
        if (data && data.length > 0) {
          lat = parseFloat(data[0].lat);
          lng = parseFloat(data[0].lon);
        }
      }
      
      if (lat && lng) {
        setCoordinates({ lat, lng });
      }
    } catch (e) {
      console.warn('Geocoding error:', e);
    }
  };

  useEffect(() => {
    if (!formData.address || !formData.city || !formData.postal_code) return;
    const delayDebounceFn = setTimeout(() => {
      triggerGeocoding();
    }, 1500);
    return () => clearTimeout(delayDebounceFn);
  }, [formData.address, formData.door_number, formData.city, formData.postal_code]);
`;

if (!settingsTab.includes('triggerGeocoding = async ()')) {
    settingsTab = settingsTab.replace(
        '  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {',
        triggerGeocodingStr + '\n  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {'
    );
    fs.writeFileSync('src/pages/partner/tabs/SettingsTab.tsx', settingsTab);
    console.log("Added triggerGeocoding to SettingsTab");
}
