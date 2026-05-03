// Simple test script: waits until /api/health responds, then logs in and registers a farm
const fetch = globalThis.fetch;
const BASE = 'http://localhost:4000/api';

async function pollHealth(retries = 20, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await fetch(`${BASE}/health`);
      if (r.ok) return true;
    } catch (e) {}
    await new Promise((r) => setTimeout(r, delay));
  }
  return false;
}

(async () => {
  const ready = await pollHealth();
  if (!ready) {
    console.error('Health check failed: API not reachable at', BASE);
    process.exit(2);
  }
  console.log('API healthy');

  // Login as demo farmer
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'farmer@test.com', password: 'farmer123456' })
  });
  const loginJson = await loginRes.json().catch(() => ({}));
  console.log('LOGIN RESPONSE:', JSON.stringify(loginJson, null, 2));

  const token = loginJson?.data?.token;
  if (!token) {
    console.error('Login failed or token missing');
    process.exit(3);
  }

  // Register a farm
  const farmRes = await fetch(`${BASE}/auth/farm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'E2E Test Farm', location: 'Local script' })
  });

  const farmJson = await farmRes.json().catch(() => ({}));
  console.log('FARM RESPONSE:', JSON.stringify(farmJson, null, 2));

  process.exit(0);
})().catch((err) => {
  console.error('Script error', err);
  process.exit(1);
});
