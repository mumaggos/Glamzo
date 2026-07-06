const fs = require('fs');
let code = fs.readFileSync('src/types/index.ts', 'utf8');

code = code.replace(
  /export interface Staff \{[\s\S]*?created_at: string;\n\}/,
  `export interface Staff {
  id: string;
  business_id: string;
  full_name: string;
  avatar_url: string | null;
  role_title: string | null;
  is_active: boolean;
  off_days?: string | null; // Comma separated weekday indices, e.g., "1,2" (Monday, Tuesday)
  email?: string | null;
  phone?: string | null;
  temp_password?: string | null;
  created_at: string;
}`
);

fs.writeFileSync('src/types/index.ts', code);
