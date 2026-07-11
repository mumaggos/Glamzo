import fs from 'fs';
let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

// I will just make sure it compiles fine, no need to patch frontend if the user can run the SQL query to add columns.
