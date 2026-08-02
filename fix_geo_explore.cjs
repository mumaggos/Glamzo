const fs = require('fs');
let code = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

code = code.replace(
  `  useEffect(() => {
    if (navigator.geolocation) {
      setGeoLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          setLocalSearchLocation(t('home.nearMe'));
          setUseNearMe(true);
          setGeoLocating(false);
        },
        () => {
          setGeoLocating(false);
        }
      );
    }
  }, [t]);`,
  ``
);

fs.writeFileSync('src/pages/Explore.tsx', code);
