import * as fs from 'fs';

let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8');

const target = `        if (data) {
          // Increment page views
          supabase.rpc('increment_page_views', { store_id: data.id }).then(() => {});`;

const newCode = `        if (data) {
          // Increment page views / QR scans
          const isQr = new URLSearchParams(window.location.search).get('source') === 'qr';
          if (isQr) {
            supabase.rpc('increment_store_stats', { store_id: data.id, stat_type: 'qr_scans_count' }).then((res) => {
              if (res.error) console.error("Error incrementing QR scans:", res.error);
            });
          } else {
            supabase.rpc('increment_store_stats', { store_id: data.id, stat_type: 'page_views' }).then((res) => {
              if (res.error) console.error("Error incrementing page views:", res.error);
            });
          }`;

if (content.includes(target)) {
  content = content.replace(target, newCode);
  fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
  console.log("Patched BusinessDetail.tsx");
} else {
  console.log("Target not found");
}
