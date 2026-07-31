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
  const places = useMapsLibrary('places');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!places || !inputRef.current) return;
    
    const options = {
      fields: ['geometry', 'name', 'formatted_address', 'address_components']
    };
    
    const instance = new places.Autocomplete(inputRef.current, options);
    setAutocomplete(instance);
    
    const listener = instance.addListener('place_changed', () => {
      const place = instance.getPlace();
      if (place && place.formatted_address) {
        onPlaceSelect(place);
        onChange(place.formatted_address);
      }
    });

    return () => {
      if (listener) {
        window.google.maps.event.removeListener(listener);
      }
      if (instance && window.google) {
        window.google.maps.event.clearInstanceListeners(instance);
      }
    };
  }, [places, onPlaceSelect, onChange]);

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
