const fs = require('fs');
let code = fs.readFileSync('src/components/AddressAutocomplete.tsx', 'utf8');

// The maps library is loaded without providing an API key in APIProvider in some cases. We should try to load it safely.
code = code.replace(
  /const autocompleteInstance = new places\.Autocomplete\(inputRef\.current, options\);/,
  `try {
      const autocompleteInstance = new places.Autocomplete(inputRef.current, options);
      setAutocomplete(autocompleteInstance);
      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace();
        if (place && place.formatted_address) {
          onPlaceSelect(place);
          onChange(place.formatted_address);
        }
      });
    } catch (err) {
      console.warn("Failed to initialize Autocomplete", err);
    }
    // We already do setAutocomplete above if successful
    return;`
);

fs.writeFileSync('src/components/AddressAutocomplete.tsx', code);
