import fs from 'fs';
let code = fs.readFileSync('src/components/GlamzoMessenger.tsx', 'utf-8');

// The `messages?.find(m => m.id === payload.new.id)` inside setMessages should be fixed
// to prevent issues.

