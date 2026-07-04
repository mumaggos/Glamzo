import fs from 'fs';
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const marker = 'import { getCoordinatesForCity, calculateDistanceInKm } from "../utils/geoData";';
const parts = content.split(marker);

if (parts.length === 2) {
    let secondPart = parts[1];
    // It seems there's a duplicate import block that starts with `port React...`
    // Let's find where the real code begins
    const realCodeStart = secondPart.indexOf('const API_KEY =');
    if (realCodeStart !== -1) {
        content = parts[0] + marker + '\\n' + secondPart.substring(realCodeStart);
        fs.writeFileSync('src/pages/Home.tsx', content);
        console.log("Fixed head");
    }
}
