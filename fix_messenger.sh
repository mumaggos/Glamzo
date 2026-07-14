sed -i 's/const thirtyMinsAgo = new Date(Date.now() - 30 \* 60 \* 1000).toISOString();/const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();/' src/components/GlamzoMessenger.tsx
sed -i 's/\.gte('"'"'created_at'"'"', thirtyMinsAgo);/\.gte('"'"'created_at'"'"', twentyFourHoursAgo);/' src/components/GlamzoMessenger.tsx
