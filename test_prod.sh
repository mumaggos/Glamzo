export NODE_ENV=production
node dist/server.cjs &
PID=$!
sleep 5
node check_dashboard.js
kill $PID
