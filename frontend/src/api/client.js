const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

function authHeaders(token) {
  return token
    ? {
        Authorization: `Bearer ${token}`
      }
    : {};
}

async function readResponse(response, fallbackMessage) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || fallbackMessage);
  }
  return payload;
}

export async function fetchHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  return readResponse(response, "Failed to fetch health status");
}

export async function fetchDevices(token) {
  const response = await fetch(`${API_BASE_URL}/devices`, {
    headers: {
      ...authHeaders(token)
    }
  });
  const payload = await readResponse(response, "Failed to fetch devices");
  return payload.data || [];
}

export async function createDevice(device, token) {
  const response = await fetch(`${API_BASE_URL}/devices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token)
    },
    body: JSON.stringify(device)
  });

  const payload = await readResponse(response, "Failed to create device");
  return payload.data;
}

export async function registerUser(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await readResponse(response, "Failed to register user");
  return data.data;
}

export async function loginUser(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await readResponse(response, "Failed to login");
  return data.data;
}

export async function fetchCurrentUser(token) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      ...authHeaders(token)
    }
  });
  const data = await readResponse(response, "Failed to fetch current user");
  return data.data;
}
