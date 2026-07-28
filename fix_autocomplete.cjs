const fs = require('fs');
let code = fs.readFileSync('src/components/AddressAutocomplete.tsx', 'utf8');

// Replace the buggy useEffect block
const target = `    try {
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
    return;
    setAutocomplete(autocompleteInstance);

    autocompleteInstance.addListener('place_changed', () => {
      const place = autocompleteInstance.getPlace();
      if (place && place.formatted_address) {
        onPlaceSelect(place);
      }
    });

    // Cleanup
    return () => {
      if (autocompleteInstance) {
        google.maps.event.clearInstanceListeners(autocompleteInstance);
      }
    };
  }, [places, onPlaceSelect]);`;

const replacement = `    let instance;
    try {
      instance = new places.Autocomplete(inputRef.current, options);
      setAutocomplete(instance);
      instance.addListener('place_changed', () => {
        const place = instance.getPlace();
        if (place && place.formatted_address) {
          onPlaceSelect(place);
          onChange(place.formatted_address);
        }
      });
    } catch (err) {
      console.warn("Failed to initialize Autocomplete", err);
    }

    // Cleanup
    return () => {
      if (instance && window.google) {
        window.google.maps.event.clearInstanceListeners(instance);
      }
    };
  }, [places, onPlaceSelect]);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/AddressAutocomplete.tsx', code);
