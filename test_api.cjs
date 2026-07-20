const fetch = require('node-fetch');

async function test() {
  const userRes = await fetch('http://localhost:3000/api/user/affiliate-referrals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'e8d8e3d4-987e-44dc-976b-ef2e4a99bc0c' }) // fake uuid
  });
  const data = await userRes.json();
  console.log(data);
}
test();
