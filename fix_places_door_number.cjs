const fs = require('fs');

let setupWizard = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

const setupHandleOld = `  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    let newAddress = '';
    let pc = '', c = '', ct = '', d = '', route = '', streetNumber = '';

    if (place.geometry?.location) {
      setCoordinates({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
    }

    if (place.address_components) {
      for (const component of place.address_components) {
        const types = component.types;
        if (types.includes('route')) route = component.long_name;
        if (types.includes('street_number')) streetNumber = component.long_name;
        if (types.includes('postal_code')) pc = component.long_name;
        if (types.includes('locality') || types.includes('postal_town') || types.includes('administrative_area_level_2')) c = component.long_name;
        if (types.includes('country')) ct = component.long_name;
        if (types.includes('administrative_area_level_1')) d = component.long_name;
      }
    }

    newAddress = [route, streetNumber].filter(Boolean).join(', ');
    
    if (newAddress) setAddress(newAddress);
    else if (place.name) setAddress(place.name);
    else if (place.formatted_address) setAddress(place.formatted_address.split(',')[0] || '');

    if (pc) setPostalCode(pc);
    if (c) setCity(c);
    if (ct) setCountry(ct);
    if (d) setDistrict(d);
  };`;

const setupHandleNew = `  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    let newAddress = '';
    let pc = '', c = '', ct = '', d = '', route = '', streetNumber = '';

    if (place.geometry?.location) {
      setCoordinates({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
    }

    if (place.address_components) {
      for (const component of place.address_components) {
        const types = component.types;
        if (types.includes('route')) route = component.long_name;
        if (types.includes('street_number')) streetNumber = component.long_name;
        if (types.includes('postal_code')) pc = component.long_name;
        if (types.includes('locality') || types.includes('postal_town') || types.includes('administrative_area_level_2')) c = component.long_name;
        if (types.includes('country')) ct = component.long_name;
        if (types.includes('administrative_area_level_1')) d = component.long_name;
      }
    }

    // Set address to route only, and doorNumber to streetNumber if available
    if (route) setAddress(route);
    else if (place.name) setAddress(place.name.replace(/\\d+/g, '').trim().replace(/,$/, ''));
    else if (place.formatted_address) setAddress(place.formatted_address.split(',')[0].replace(/\\d+/g, '').trim());

    if (streetNumber) setDoorNumber(streetNumber);
    if (pc) setPostalCode(pc);
    if (c) setCity(c);
    if (ct) setCountry(ct);
    if (d) setDistrict(d);
  };`;

if (setupWizard.includes(setupHandleOld)) {
    setupWizard = setupWizard.replace(setupHandleOld, setupHandleNew);
    fs.writeFileSync('src/pages/partner/SetupWizard.tsx', setupWizard);
}

let settingsTab = fs.readFileSync('src/pages/partner/tabs/SettingsTab.tsx', 'utf8');

const settingsHandleOld = `  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    let newFormData = { ...formData };
    let pc = '', c = '', ct = '', route = '', streetNumber = '';

    if (place.geometry?.location) {
      setCoordinates({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
    }
    
    if (place.address_components) {
      for (const component of place.address_components) {
        const types = component.types;
        if (types.includes('route')) route = component.long_name;
        if (types.includes('street_number')) streetNumber = component.long_name;
        if (types.includes('postal_code')) pc = component.long_name;
        if (types.includes('locality') || types.includes('postal_town') || types.includes('administrative_area_level_2')) c = component.long_name;
        if (types.includes('country')) ct = component.long_name;
      }
    }

    const newAddress = [route, streetNumber].filter(Boolean).join(', ');
    if (newAddress) newFormData.address = newAddress;
    else if (place.name) newFormData.address = place.name;
    else if (place.formatted_address) newFormData.address = place.formatted_address.split(',')[0];

    if (pc) newFormData.postal_code = pc;
    if (c) newFormData.city = c;
    if (ct) newFormData.country = ct;
    
    setFormData(newFormData);
  };`;

const settingsHandleNew = `  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    let newFormData = { ...formData };
    let pc = '', c = '', ct = '', route = '', streetNumber = '';

    if (place.geometry?.location) {
      setCoordinates({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
    }
    
    if (place.address_components) {
      for (const component of place.address_components) {
        const types = component.types;
        if (types.includes('route')) route = component.long_name;
        if (types.includes('street_number')) streetNumber = component.long_name;
        if (types.includes('postal_code')) pc = component.long_name;
        if (types.includes('locality') || types.includes('postal_town') || types.includes('administrative_area_level_2')) c = component.long_name;
        if (types.includes('country')) ct = component.long_name;
      }
    }

    if (route) newFormData.address = route;
    else if (place.name) newFormData.address = place.name.replace(/\\d+/g, '').trim().replace(/,$/, '');
    else if (place.formatted_address) newFormData.address = place.formatted_address.split(',')[0].replace(/\\d+/g, '').trim();

    if (streetNumber) newFormData.door_number = streetNumber;
    if (pc) newFormData.postal_code = pc;
    if (c) newFormData.city = c;
    if (ct) newFormData.country = ct;
    
    setFormData(newFormData);
  };`;

if (settingsTab.includes(settingsHandleOld)) {
    settingsTab = settingsTab.replace(settingsHandleOld, settingsHandleNew);
    fs.writeFileSync('src/pages/partner/tabs/SettingsTab.tsx', settingsTab);
}

