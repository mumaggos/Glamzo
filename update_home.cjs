const fs = require('fs');

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const splitPoint = "      {/* 2. CATEGORIAS FOTOGRÁFICAS PREMIUM */}";
const endPoint = "    </div>\n  );\n}\n";

const parts = content.split(splitPoint);

if (parts.length === 2) {
  let topPart = parts[0];
  
  // Add the lazy import at the top
  const lazyImport = "\nconst HomeBelowFold = lazy(() => import('../components/HomeBelowFold'));\n";
  topPart = topPart.replace("const HomeMap = lazy(() => import(\"../components/HomeMap\"));", lazyImport);
  
  // End the component by rendering HomeBelowFold
  const bottomReplacement = `
      <Suspense fallback={<div className="h-96 w-full flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 text-purple-600 animate-spin" /></div>}>
        <HomeBelowFold 
          HOME_CATEGORIES={HOME_CATEGORIES}
          loading={loading}
          locaisProximos={locaisProximos}
          recomendados={recomendados}
          novasLojas={novasLojas}
          BusinessCard={BusinessCard}
          mapRef={mapRef}
          mapVisible={mapVisible}
          userCoords={userCoords}
          mapBusinesses={mapBusinesses}
          currentLangCode={currentLangCode}
        />
      </Suspense>
    </div>
  );
}

export default Home;
`;
  
  fs.writeFileSync('src/pages/Home.tsx', topPart + bottomReplacement);
  console.log("Successfully updated Home.tsx");
} else {
  console.log("Failed to split Home.tsx");
}
