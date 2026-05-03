// Create a fresh farmer user (with unique email), then login and register a farm
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

  const unique = Date.now();
  const email = `e2e.user.${unique}@example.com`;
  const password = 'password123';

  console.log('Registering user', email);
  const regRes = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'E2E User', email, password })
  });
  const regJson = await regRes.json().catch(() => ({}));
  console.log('REGISTER RESPONSE:', JSON.stringify(regJson, null, 2));

  if (!regJson?.data?.token) {
    console.error('Registration failed');
    process.exit(3);
  }

  // login
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const loginJson = await loginRes.json().catch(() => ({}));
  console.log('LOGIN RESPONSE:', JSON.stringify(loginJson, null, 2));

  const token = loginJson?.data?.token;
  if (!token) {
    console.error('Login failed or token missing');
    process.exit(4);
  }

  // Register a farm
  const farmRes = await fetch(`${BASE}/auth/farm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'E2E Fresh Farm', location: 'Scripted' })
  });

  const farmJson = await farmRes.json().catch(() => ({}));
  console.log('FARM RESPONSE:', JSON.stringify(farmJson, null, 2));

  process.exit(0);
})().catch((err) => {
  console.error('Script error', err);
  process.exit(1);
});
