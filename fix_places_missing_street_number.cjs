const fs = require('fs');

let setupWizard = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

const setupOld = `    if (route) setAddress(route);
    else if (place.name) setAddress(place.name.replace(/\\d+/g, '').trim().replace(/,$/, ''));
    else if (place.formatted_address) setAddress(place.formatted_address.split(',')[0].replace(/\\d+/g, '').trim());

    if (streetNumber) setDoorNumber(streetNumber);`;

const setupNew = `    let finalDoorNumber = streetNumber;
    
    if (route) {
        setAddress(route);
    } else if (place.name) {
        setAddress(place.name.replace(/\\d+/g, '').trim().replace(/,$/, ''));
        if (!finalDoorNumber) {
            const match = place.name.match(/\\d+/);
            if (match) finalDoorNumber = match[0];
        }
    } else if (place.formatted_address) {
        setAddress(place.formatted_address.split(',')[0].replace(/\\d+/g, '').trim());
    }

    if (finalDoorNumber) setDoorNumber(finalDoorNumber);`;

setupWizard = setupWizard.replace(setupOld, setupNew);
fs.writeFileSync('src/pages/partner/SetupWizard.tsx', setupWizard);


let settingsTab = fs.readFileSync('src/pages/partner/tabs/SettingsTab.tsx', 'utf8');

const settingsOld = `    if (route) newFormData.address = route;
    else if (place.name) newFormData.address = place.name.replace(/\\d+/g, '').trim().replace(/,$/, '');
    else if (place.formatted_address) newFormData.address = place.formatted_address.split(',')[0].replace(/\\d+/g, '').trim();

    if (streetNumber) newFormData.door_number = streetNumber;`;

const settingsNew = `    let finalDoorNumber = streetNumber;

    if (route) {
        newFormData.address = route;
    } else if (place.name) {
        newFormData.address = place.name.replace(/\\d+/g, '').trim().replace(/,$/, '');
        if (!finalDoorNumber) {
            const match = place.name.match(/\\d+/);
            if (match) finalDoorNumber = match[0];
        }
    } else if (place.formatted_address) {
        newFormData.address = place.formatted_address.split(',')[0].replace(/\\d+/g, '').trim();
    }

    if (finalDoorNumber) newFormData.door_number = finalDoorNumber;`;

settingsTab = settingsTab.replace(settingsOld, settingsNew);
fs.writeFileSync('src/pages/partner/tabs/SettingsTab.tsx', settingsTab);

console.log("Updated door number extraction logic");
