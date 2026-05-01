import { useState } from "react";
import { createReading } from "../api/client";

export default function AddReadingForm({ devices = [], token, onSuccess }) {
  const [deviceId, setDeviceId] = useState(devices.length ? String(devices[0].id) : "");
  const [metric, setMetric] = useState("soil_moisture");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [recordedAt, setRecordedAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const created = await createReading(
        {
          deviceId: Number(deviceId),
          metric: metric.trim(),
          value: Number(value),
          unit: unit.trim() || undefined,
          recordedAt: recordedAt || undefined
        },
        token
      );

      if (onSuccess) {
        onSuccess(created);
      }

      setValue("");
      setUnit("");
      setRecordedAt("");
    } catch (err) {
      setError(err.message || "Failed to create reading");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="reading-form" onSubmit={handleSubmit}>
      <label className="field-group">
        <span>Device</span>
        <select value={deviceId} onChange={(event) => setDeviceId(event.target.value)} required>
          {devices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.name} - {device.serialNumber}
            </option>
          ))}
        </select>
      </label>

      <label className="field-group">
        <span>Metric</span>
        <input
          placeholder="Metric, e.g. soil_moisture"
          value={metric}
          onChange={(event) => setMetric(event.target.value)}
          required
        />
      </label>

      <label className="field-group">
        <span>Value</span>
        <input
          type="number"
          step="any"
          placeholder="Value"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          required
        />
      </label>

      <label className="field-group">
        <span>Unit (optional)</span>
        <input
          placeholder="% | °C | kPa"
          value={unit}
          onChange={(event) => setUnit(event.target.value)}
        />
      </label>

      <label className="field-group">
        <span>Recorded at (optional)</span>
        <input
          type="datetime-local"
          value={recordedAt}
          onChange={(event) => setRecordedAt(event.target.value)}
        />
      </label>

      <button className="ghost-button primary-action" type="submit" disabled={submitting || !deviceId}>
        {submitting ? "Adding..." : "Add Reading"}
      </button>

      {error ? <p className="error">{error}</p> : null}
    </form>
  );
}
