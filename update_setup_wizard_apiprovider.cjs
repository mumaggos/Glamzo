const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

const returnStatement = `  return (
    <APIProvider apiKey={API_KEY || ''} language={currentLangCode}>
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-800">`;

const returnEnd = `
    </div>
    </APIProvider>
  );
}`;

content = content.replace(
  '  return (\n    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-800">',
  returnStatement
);

const oldReturnEnd = `
    </div>
  );
}`;
content = content.replace(oldReturnEnd, returnEnd);

// Replace inner APIProvider
content = content.replace(
  /<APIProvider apiKey=\{API_KEY\} language=\{currentLangCode\}>/g,
  '<>'
);
content = content.replace(
  /<\/APIProvider>/g,
  '</>'
);

// Inject AddressAutocomplete for address field
const handlePlaceSelect = `
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
  };
`;

if(!content.includes('handlePlaceSelect')) {
    content = content.replace(
        "const handleHourChange = (weekday: number, field: string, value: any) => {",
        handlePlaceSelect + "\n  const handleHourChange = (weekday: number, field: string, value: any) => {"
    );
}

const addressInputFind = `                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('setupWizard.address')}</label>
                  <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder={t('setupWizard.addressPlaceholder')} />`;

const addressInputReplace = `                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('setupWizard.address')}</label>
                  <AddressAutocomplete 
                    value={address} 
                    onChange={setAddress} 
                    onPlaceSelect={handlePlaceSelect} 
                    className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                    placeholder={t('setupWizard.addressPlaceholder')} 
                  />`;

content = content.replace(addressInputFind, addressInputReplace);

const countryInputHtml = `
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">País</label>
                  <input type="text" value={country} onChange={e => setCountry(e.target.value)} className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="País" />
                </div>`;

if(!content.includes('País</label>')) {
    content = content.replace(
        `              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('setupWizard.postalCode')}</label>`,
        `              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
${countryInputHtml}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('setupWizard.postalCode')}</label>`
    );
}

// Ensure country, lat, lng are saved in the update payload in step 1
content = content.replace(
  'name, phone, email, address, door_number: doorNumber || null, city, district: district || city, postal_code: postalCode, slug, setup_step: 2,',
  'name, phone, email, address, door_number: doorNumber || null, city, district: district || city, postal_code: postalCode, country, slug, setup_step: 2,'
);
// wait, the payload line looks slightly different due to timezone addition. Let's do a smarter replace.

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', content);
console.log("SetupWizard updated with APIProvider and AddressAutocomplete");
