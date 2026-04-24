import { useEffect, useState } from "react";
import { createDevice, fetchDevices, fetchHealth } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const { token, user, logout } = useAuth();
  const [health, setHealth] = useState("checking...");
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    serialNumber: "",
    farmId: ""
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        const healthData = await fetchHealth();
        setHealth(healthData.status);
      } catch (err) {
        setHealth("offline");
      }
    }

    loadDashboard();
  }, []);

  useEffect(() => {
    async function loadDevices() {
      setLoadingDevices(true);
      setError("");
      try {
        const deviceRows = await fetchDevices(token);
        setDevices(deviceRows);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingDevices(false);
      }
    }

    loadDevices();
  }, [token]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const created = await createDevice({
        name: formData.name,
        serialNumber: formData.serialNumber,
        farmId: formData.farmId ? Number(formData.farmId) : null
      }, token);
      setDevices((prev) => [created, ...prev]);
      setFormData({ name: "", serialNumber: "", farmId: "" });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="page">
      <header className="hero">
        <h1>SmartSeason Field Monitoring</h1>
        <div className="session-row">
          <span>
            Signed in as <strong>{user?.name || user?.email}</strong>
          </span>
          <button className="ghost-button" type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <section className="stats-grid">
        <StatCard label="API Status" value={health} />
        <StatCard label="Devices" value={devices.length} />
        <StatCard label="Active Alerts" value="0" />
      </section>

      <section className="panel">
        <h2>Register Device</h2>
        <form className="device-form" onSubmit={handleSubmit}>
          <input
            placeholder="Device Name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />
          <input
            placeholder="Serial Number"
            value={formData.serialNumber}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, serialNumber: e.target.value }))
            }
            required
          />
          <input
            type="number"
            min="1"
            placeholder="Farm ID (optional)"
            value={formData.farmId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, farmId: e.target.value }))
            }
          />
          <button type="submit">Add Device</button>
        </form>
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="panel">
        <h2>Device List</h2>
        {loadingDevices ? <p>Loading devices...</p> : null}
        {!loadingDevices && devices.length === 0 ? <p>No devices yet.</p> : null}
        {!loadingDevices && devices.length > 0 ? (
          <ul className="device-list">
            {devices.map((device) => (
              <li key={device.id}>
                <strong>{device.name}</strong>
                <span>SN: {device.serialNumber}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  );
}
