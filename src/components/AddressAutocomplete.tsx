import React, { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface AddressAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder,
  className
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Conditionally get the maps library. We'll wrap with try-catch in case we are not inside APIProvider
  let places: google.maps.PlacesLibrary | null = null;
  try {
    places = useMapsLibrary('places');
  } catch (e) {
    console.warn("APIProvider not found or Maps library failed to load.", e);
  }

  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ['geometry', 'name', 'formatted_address', 'address_components']
    };

    let instance;
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
  }, [places, onPlaceSelect]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      placeholder={placeholder || 'Comece a escrever a morada...'}
    />
  );
};
