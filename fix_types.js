const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf8');

if (!content.includes('timezone?: string;')) {
    content = content.replace('export interface Business {', "export interface Business {\n  timezone?: string;");
}

if (!content.includes('start_datetime?: string;')) {
    content = content.replace('export interface Booking {', "export interface Booking {\n  start_datetime?: string;\n  end_datetime?: string;");
}

fs.writeFileSync('src/types/index.ts', content);
