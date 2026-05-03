import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BadgePlus,
  BarChart3,
  Building2,
  Download,
  FileText,
  Hash,
  LogOut,
  PlusCircle,
  Radar
} from "lucide-react";
import { createDevice, fetchDevices, fetchHealth, fetchReadings, registerOwnFarm } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import ReadingsTrendChart from "../components/ReadingsTrendChart";
import StatCard from "../components/StatCard";

function formatCsvValue(value) {
  const normalized = value === null || value === undefined ? "" : String(value);
  return `"${normalized.replaceAll('"', '""')}"`;
}

function buildCsv(rows) {
  const headers = ["id", "deviceName", "serialNumber", "metric", "value", "unit", "recordedAt", "createdAt"];
  return [headers.join(",")]
    .concat(
      rows.map((row) =>
        [row.id, row.deviceName, row.serialNumber, row.metric, row.value, row.unit, row.recordedAt, row.createdAt]
          .map(formatCsvValue)
          .join(",")
      )
    )
    .join("\n");
}

export default function Dashboard() {
  const { token, user, logout, applySession } = useAuth();
  const [health, setHealth] = useState("checking...");
  const [devices, setDevices] = useState([]);
  const [readings, setReadings] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [loadingReadings, setLoadingReadings] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    serialNumber: "",
    farmId: ""
  });
  const [readingFilters, setReadingFilters] = useState({
    deviceId: "all",
    metric: "soil_moisture"
  });
  const [farmForm, setFarmForm] = useState({
    name: "",
    location: ""
  });
  const [farmSubmitting, setFarmSubmitting] = useState(false);
  const [farmError, setFarmError] = useState("");

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

  useEffect(() => {
    async function loadReadings() {
      setLoadingReadings(true);
      setError("");

      try {
        const selectedDeviceId = readingFilters.deviceId === "all" ? null : Number(readingFilters.deviceId);
        const readingRows = await fetchReadings(token, {
          deviceId: Number.isNaN(selectedDeviceId) ? null : selectedDeviceId,
          metric: readingFilters.metric.trim() || null,
          limit: 12
        });

        setReadings(readingRows);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingReadings(false);
      }
    }

    loadReadings();
  }, [token, readingFilters.deviceId, readingFilters.metric]);

  useEffect(() => {
    function handleReadingsUpdated() {
      const selectedDeviceId = readingFilters.deviceId === "all" ? null : Number(readingFilters.deviceId);

      fetchReadings(token, {
        deviceId: Number.isNaN(selectedDeviceId) ? null : selectedDeviceId,
        metric: readingFilters.metric.trim() || null,
        limit: 12
      })
        .then((readingRows) => {
          setReadings(readingRows);
        })
        .catch((err) => {
          setError(err.message);
        });
    }

    window.addEventListener("smartseason:readings-updated", handleReadingsUpdated);
    return () => window.removeEventListener("smartseason:readings-updated", handleReadingsUpdated);
  }, [token, readingFilters.deviceId, readingFilters.metric]);

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

  async function handleFarmRegister(event) {
    event.preventDefault();
    setFarmError("");
    setFarmSubmitting(true);

    try {
      const data = await registerOwnFarm(
        {
          name: farmForm.name,
          location: farmForm.location || null
        },
        token
      );

      applySession({ token: data.token, user: data.user });
        try {
          window.dispatchEvent(new CustomEvent("smartseason:farm-registered", { detail: { farm: data.farm, user: data.user } }));
        } catch (e) {
          // ignore in non-browser environments
        }
      setFarmForm({ name: "", location: "" });
    } catch (err) {
      setFarmError(err.message || "Could not register farm");
    } finally {
      setFarmSubmitting(false);
    }
  }

  function sanitizeErrorMessage(msg) {
    if (!msg) return null;
    const m = String(msg).toLowerCase();
    if (m.includes('duplicate') || m.includes('already exists') || m.includes('er_dup_entry')) {
      return 'A device with this serial number already exists.';
    }
    if (m.includes('foreign key') || m.includes('cannot add or update a child row') || m.includes('fk_devices_farm')) {
      return 'Invalid farm id — the farm could not be found.';
    }
    if (m.includes('incorrect arguments') || m.includes('mysqli_stmt_execute') || m.includes('invalid')) {
      return 'Invalid input data. Check the values and try again.';
    }
    // fallback: short, non-technical message
    return 'Could not complete the request. Please try again.';
  }

  function handleExportReadingsCsv() {
    const blob = new Blob([buildCsv(readings)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `smartseason-dashboard-readings-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="page">
      <header className="hero">
        <h1>SmartSeason Field Monitoring</h1>
        <div className="session-row">
          <span>
            Signed in as <strong>{user?.name || user?.email}</strong>
          </span>
          <div className="session-actions">
            <Link className="ghost-button" to="/readings">
              <FileText className="button-icon" aria-hidden="true" />
              Historical Readings
            </Link>
            {user?.role === "agronomist" || user?.role === "admin" ? (
              <Link className="ghost-button primary-action" to="/readings/new">
                <BadgePlus className="button-icon" aria-hidden="true" />
                Add Reading
              </Link>
            ) : null}
            <button className="ghost-button" type="button" onClick={handleExportReadingsCsv} disabled={!readings.length}>
              <Download className="button-icon" aria-hidden="true" />
              Export CSV
            </button>
            <button className="ghost-button" type="button" onClick={logout}>
              <LogOut className="button-icon" aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="stats-grid">
        <StatCard label="API Status" value={health} icon={Radar} />
        <StatCard label="Devices" value={devices.length} icon={Building2} />
        <StatCard label="Recent Readings" value={readings.length} icon={Activity} />
      </section>

      {user?.role === "farmer" && !user?.farmId ? (
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow icon-eyebrow">
                <Building2 className="button-icon" aria-hidden="true" />
                Farm setup
              </p>
              <h2>Register Your Farm</h2>
              <p>Create your farm profile to unlock farm-scoped data.</p>
            </div>
          </div>

          <form className="device-form" onSubmit={handleFarmRegister}>
            <label className="input-with-icon">
              <span className="input-icon" aria-hidden="true">
                <Building2 className="button-icon" />
              </span>
              <input
                placeholder="Farm Name"
                value={farmForm.name}
                onChange={(event) =>
                  setFarmForm((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
            </label>

            <label className="input-with-icon">
              <span className="input-icon" aria-hidden="true">
                <Hash className="button-icon" />
              </span>
              <input
                placeholder="Location (optional)"
                value={farmForm.location}
                onChange={(event) =>
                  setFarmForm((prev) => ({ ...prev, location: event.target.value }))
                }
              />
            </label>

            <button type="submit" disabled={farmSubmitting}>
              <PlusCircle className="button-icon" aria-hidden="true" />
              {farmSubmitting ? "Registering..." : "Register Farm"}
            </button>
          </form>

          {farmError ? <p className="error">{farmError}</p> : null}
        </section>
      ) : null}

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Readings Trend</h2>
            <p>Track the latest sensor values for a device and metric.</p>
          </div>
          <div className="reading-filters">
            <select
              value={readingFilters.deviceId}
              onChange={(e) =>
                setReadingFilters((prev) => ({ ...prev, deviceId: e.target.value }))
              }
            >
              <option value="all">All devices</option>
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name}
                </option>
              ))}
            </select>
            <input
              placeholder="Metric, e.g. soil_moisture"
              value={readingFilters.metric}
              onChange={(e) =>
                setReadingFilters((prev) => ({ ...prev, metric: e.target.value }))
              }
            />
          </div>
        </div>

        {loadingReadings ? <p>Loading readings...</p> : null}
        {!loadingReadings ? (
          <ReadingsTrendChart
            readings={readings}
            title={readingFilters.metric || "Readings"}
          />
        ) : null}

        {!loadingReadings && readings.length > 0 ? (
          <ul className="reading-list">
            {readings
              .slice()
              .reverse()
              .map((reading) => (
                <li key={reading.id}>
                  <div>
                    <strong>{reading.deviceName}</strong>
                    <span>{reading.metric}</span>
                  </div>
                  <div className="reading-value">
                    <strong>
                      {reading.value}
                      {reading.unit ? ` ${reading.unit}` : ""}
                    </strong>
                    <span>{new Date(reading.recordedAt).toLocaleString()}</span>
                  </div>
                </li>
              ))}
          </ul>
        ) : null}
      </section>

      {user?.role === "agronomist" || user?.role === "admin" ? (
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow icon-eyebrow">
              <BadgePlus className="button-icon" aria-hidden="true" />
              Device onboarding
            </p>
            <h2>Register Device</h2>
            <p>Add a new device to the farm registry.</p>
          </div>
        </div>
        <form className="device-form" onSubmit={handleSubmit}>
          <label className="input-with-icon">
            <span className="input-icon" aria-hidden="true">
              <BarChart3 className="button-icon" />
            </span>
            <input
              placeholder="Device Name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </label>
          <label className="input-with-icon">
            <span className="input-icon" aria-hidden="true">
              <Hash className="button-icon" />
            </span>
            <input
              placeholder="Serial Number"
              value={formData.serialNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, serialNumber: e.target.value }))
              }
              required
            />
          </label>
          <div className="field-group">
            <label className="input-with-icon">
              <span className="input-icon" aria-hidden="true">
                <Building2 className="button-icon" />
              </span>
              <input
                type="number"
                min="1"
                placeholder="Farm ID, auto-created if missing"
                value={formData.farmId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, farmId: e.target.value }))
                }
              />
            </label>
          </div>
          <button type="submit">
            <PlusCircle className="button-icon" aria-hidden="true" />
            Add Device
          </button>
        </form>
        {sanitizeErrorMessage(error) ? <p className="error">{sanitizeErrorMessage(error)}</p> : null}
      </section>
      ) : null}

      <section className="panel">
        <h2>Device List</h2>
        {loadingDevices ? <p>Loading devices...</p> : null}
        {!loadingDevices && devices.length === 0 ? <p>No devices yet.</p> : null}
        {!loadingDevices && devices.length > 0 ? (
          <ul className="device-list">
            {devices.map((device) => (
              <li key={device.id}>
                <div>
                  <strong>{device.name}</strong>
                  <span>SN: {device.serialNumber}</span>
                </div>
                <Link className="device-link" to={`/readings?deviceId=${device.id}`}>
                  <ArrowRight className="button-icon" aria-hidden="true" />
                  View readings
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  );
}
