const fs = require('fs');

let content = fs.readFileSync('src/components/LanguageUpdater.tsx', 'utf8');

// I will make it accept the rest of the url instead of Outlet, and just use Navigate or something else...
// Oh wait, Outlet is correct. We just need to remove absolute paths from the children, but absolute paths on the root Routes children are fine.
// Wait! If the route is `/:lang/*`, then the children shouldn't be absolute from `/`, they should be relative. Let's just fix React Router's limitation by not using nested routes if it complains.
