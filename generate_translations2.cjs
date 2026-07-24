const fs = require('fs');

let text = fs.readFileSync('src/i18n.ts', 'utf8');

// I will just use regex to replace the cookies block in EN
// Since the cookies block is literally exactly the same string in all languages!

// Wait, the cookies block starts with `"cookies": {` and ends with `"payments": {`.
// It's much easier to just do it manually.

