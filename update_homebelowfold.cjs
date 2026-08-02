const fs = require('fs');
let code = fs.readFileSync('src/components/HomeBelowFold.tsx', 'utf8');

// Add useRef and useState imports
code = code.replace(
  'import React, { Suspense, lazy } from "react";',
  'import React, { Suspense, lazy, useState, useRef, useEffect } from "react";'
);

// Remove from props
code = code.replace('  mapRef,\n', '');
code = code.replace('  mapVisible,\n', '');

// Add state and effect inside component
const stateCode = `  const { t } = useTranslation();
  const [mapVisible, setMapVisible] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setMapVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '300px' });
    if (mapRef.current) observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);`;

code = code.replace('  const { t } = useTranslation();', stateCode);

fs.writeFileSync('src/components/HomeBelowFold.tsx', code);
