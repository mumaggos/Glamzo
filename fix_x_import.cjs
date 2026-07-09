const fs = require('fs');
let text = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');

if (!text.includes(', X')) {
  text = text.replace('Plus, ArrowRight, Star, Clock, AlertCircle, ShoppingBag, Euro', 'Plus, ArrowRight, Star, Clock, AlertCircle, ShoppingBag, Euro, X');
}

fs.writeFileSync('src/components/DashboardOverview.tsx', text);
