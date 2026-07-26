const fs = require('fs');

let setupWizard = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

const oldSetupHandle = `
  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.name || place.formatted_address) {
      setAddress(place.name || place.formatted_address || '');
    }
    
    if (place.geometry?.location) {
      setCoordinates({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
    }

    if (place.address_components) {
      let pc = '', c = '', ct = '', d = '';
      for (const component of place.address_components) {
        const types = component.types;
        if (types.includes('postal_code')) pc = component.long_name;
        if (types.includes('locality') || types.includes('postal_town')) c = component.long_name;
        if (types.includes('country')) ct = component.long_name;
        if (types.includes('administrative_area_level_1')) d = component.long_name;
      }
      if (pc) setPostalCode(pc);
      if (c) setCity(c);
      if (ct) setCountry(ct);
      if (d) setDistrict(d);
    }
  };`;

const newSetupHandle = `  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
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

if(setupWizard.includes(oldSetupHandle)) {
    setupWizard = setupWizard.replace(oldSetupHandle, newSetupHandle);
    fs.writeFileSync('src/pages/partner/SetupWizard.tsx', setupWizard);
} else {
    console.log("Could not find old handlePlaceSelect in SetupWizard");
}

let settingsTab = fs.readFileSync('src/pages/partner/tabs/SettingsTab.tsx', 'utf8');

const oldSettingsHandle = `
  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    let newFormData = { ...formData };
    if (place.name || place.formatted_address) {
      newFormData.address = place.name || place.formatted_address || '';
    }
    if (place.geometry?.location) {
      setCoordinates({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
    }
    if (place.address_components) {
      for (const component of place.address_components) {
        const types = component.types;
        if (types.includes('postal_code')) newFormData.postal_code = component.long_name;
        if (types.includes('locality') || types.includes('postal_town')) newFormData.city = component.long_name;
        if (types.includes('country')) newFormData.country = component.long_name;
      }
    }
    setFormData(newFormData);
  };`;

const newSettingsHandle = `  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
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

if (settingsTab.includes(oldSettingsHandle)) {
    settingsTab = settingsTab.replace(oldSettingsHandle, newSettingsHandle);
    fs.writeFileSync('src/pages/partner/tabs/SettingsTab.tsx', settingsTab);
} else {
    console.log("Could not find old handlePlaceSelect in SettingsTab");
}
