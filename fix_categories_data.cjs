const fs = require('fs');

let code = fs.readFileSync('src/utils/categoriesData.ts', 'utf8');

// The main categories are translated (they have nameKey and descKey), but we also have SUBCATEGORIES_BY_MAIN and BARBER_SERVICES.
// Wait, SUBCATEGORIES_BY_MAIN values are strings. We should map them.
// But wait! SUBCATEGORIES_BY_MAIN is a Record<string, string[]>. It's used as static data.
// If we translate these, we need to change it to use translation keys OR return a function that uses `t()`.
