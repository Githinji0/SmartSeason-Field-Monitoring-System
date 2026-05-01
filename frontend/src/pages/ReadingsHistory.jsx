import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Download, Filter, Search } from "lucide-react";
import { fetchDevices, fetchReadings } from "../api/client";
import { useAuth } from "../auth/AuthContext";

function parseFilters(searchParams) {
  return {
    deviceId: searchParams.get("deviceId") || "all",
    metric: searchParams.get("metric") || "",
    since: searchParams.get("since") || "",
    until: searchParams.get("until") || ""
  };
}

function parsePage(searchParams) {
  const parsed = Number.parseInt(searchParams.get("page") || "1", 10);
  return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
}

function formatCsvValue(value) {
  const normalized = value === null || value === undefined ? "" : String(value);
  return `"${normalized.replaceAll('"', '""')}"`;
}

function sanitizeErrorMessage(message) {
  if (!message) {
    return null;
  }

  const normalized = String(message).toLowerCase();

  if (normalized.includes("incorrect arguments") || normalized.includes("mysqld_stmt_execute")) {
    return "The readings query could not be loaded. Please try again.";
  }

  if (normalized.includes("network") || normalized.includes("fetch")) {
    return "The readings service is unavailable right now.";
  }

  return message;
}

function buildCsv(rows) {
  const headers = [
    "id",
    "deviceName",
    "serialNumber",
    "metric",
    "value",
    "unit",
    "recordedAt",
    "createdAt"
  ];

  const lines = [headers.join(",")];

  rows.forEach((row) => {
    lines.push(
      [
        row.id,
        row.deviceName,
        row.serialNumber,
        row.metric,
        row.value,
        row.unit,
        row.recordedAt,
        row.createdAt
      ]
        .map(formatCsvValue)
        .join(",")
    );
  });

  return lines.join("\n");
}

function formatLocalDateTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

export default function ReadingsHistory() {
  const { token, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [devices, setDevices] = useState([]);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(() => parseFilters(searchParams));
  const [page, setPage] = useState(() => parsePage(searchParams));
  const pageSize = 20;

  useEffect(() => {
    const nextFilters = parseFilters(searchParams);
    const nextPage = parsePage(searchParams);

    setFilters((currentFilters) => {
      const currentKey = JSON.stringify(currentFilters);
      const nextKey = JSON.stringify(nextFilters);
      return currentKey === nextKey ? currentFilters : nextFilters;
    });

    setPage((currentPage) => (currentPage === nextPage ? currentPage : nextPage));
  }, [searchParams]);

  useEffect(() => {
    async function loadDevices() {
      try {
        const deviceRows = await fetchDevices(token);
        setDevices(deviceRows);
      } catch (err) {
        setError(sanitizeErrorMessage(err.message));
      }
    }

    loadDevices();
  }, [token]);

  useEffect(() => {
    async function loadReadings() {
      setLoading(true);
      setError("");

      try {
        const selectedDeviceId = filters.deviceId === "all" ? null : Number(filters.deviceId);
        const rows = await fetchReadings(token, {
          deviceId: Number.isNaN(selectedDeviceId) ? null : selectedDeviceId,
          metric: filters.metric.trim() || null,
          since: filters.since ? new Date(`${filters.since}T00:00:00`).toISOString() : null,
          until: filters.until ? new Date(`${filters.until}T23:59:59`).toISOString() : null,
          limit: 200
        });

        setReadings(rows);
      } catch (err) {
        setError(sanitizeErrorMessage(err.message));
      } finally {
        setLoading(false);
      }
    }

    loadReadings();
  }, [filters.deviceId, filters.metric, filters.since, filters.until, token]);

  useEffect(() => {
    const nextSearchParams = new URLSearchParams();

    if (filters.deviceId !== "all") {
      nextSearchParams.set("deviceId", filters.deviceId);
    }

    if (filters.metric.trim()) {
      nextSearchParams.set("metric", filters.metric.trim());
    }

    if (filters.since) {
      nextSearchParams.set("since", filters.since);
    }

    if (filters.until) {
      nextSearchParams.set("until", filters.until);
    }

    if (page > 1) {
      nextSearchParams.set("page", String(page));
    }

    setSearchParams(nextSearchParams, { replace: true });
  }, [filters, page, setSearchParams]);

  const totalPages = Math.max(1, Math.ceil(readings.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleReadings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return readings.slice(start, start + pageSize);
  }, [currentPage, readings]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const csvText = useMemo(() => buildCsv(readings), [readings]);

  function handleExportCsv() {
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `smartseason-readings-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="page">
      <header className="hero history-hero">
        <div>
          <p className="eyebrow">Historical data</p>
          <h1>Readings History</h1>
          <p>
            Browse sensor data across devices, filter it down, and export the current view for
            analysis or reporting.
          </p>
        </div>
        <div className="session-actions">
          <Link className="ghost-button" to="/">
            <ArrowLeft className="button-icon" aria-hidden="true" />
            Back to dashboard
          </Link>
          <button
            className="ghost-button primary-action"
            type="button"
            onClick={handleExportCsv}
            disabled={!readings.length}
          >
            <Download className="button-icon" aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <p className="stat-label">Signed in as</p>
          <h3 className="stat-value">{user?.name || user?.email}</h3>
        </article>
        <article className="stat-card">
          <p className="stat-label">Devices in scope</p>
          <h3 className="stat-value">{devices.length}</h3>
        </article>
        <article className="stat-card">
          <p className="stat-label">Returned readings</p>
          <h3 className="stat-value">{readings.length}</h3>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow icon-eyebrow">
              <Filter className="button-icon" aria-hidden="true" />
              Filter controls
            </p>
            <h2>Filters</h2>
            <p>Use date ranges or device selection to narrow the dataset before exporting.</p>
          </div>
        </div>

        <div className="history-filters">
          <select
            value={filters.deviceId}
            onChange={(e) => {
              setPage(1);
              setFilters((prev) => ({ ...prev, deviceId: e.target.value }));
            }}
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
            value={filters.metric}
            onChange={(e) => {
              setPage(1);
              setFilters((prev) => ({ ...prev, metric: e.target.value }));
            }}
          />
          <input
            type="date"
            value={filters.since}
            onChange={(e) => {
              setPage(1);
              setFilters((prev) => ({ ...prev, since: e.target.value }));
            }}
          />
          <input
            type="date"
            value={filters.until}
            onChange={(e) => {
              setPage(1);
              setFilters((prev) => ({ ...prev, until: e.target.value }));
            }}
          />
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow icon-eyebrow">
              <Search className="button-icon" aria-hidden="true" />
              Query results
            </p>
            <h2>Historical Readings</h2>
            <p>Newest records appear first. Export uses the same filtered results.</p>
          </div>
          <span className="muted-pill">Limit: 200</span>
        </div>

        {loading ? <p>Loading readings...</p> : null}
        {!loading && error ? <p className="error">{error}</p> : null}
        {!loading && !error && readings.length === 0 ? <p>No readings found for the current filters.</p> : null}

        {!loading && readings.length > 0 ? (
          <div className="table-wrap">
            <table className="readings-table">
              <thead>
                <tr>
                  <th>Recorded</th>
                  <th>Device</th>
                  <th>Metric</th>
                  <th>Value</th>
                  <th>Farm</th>
                </tr>
              </thead>
              <tbody>
                {visibleReadings.map((reading) => (
                  <tr key={reading.id}>
                    <td>{formatLocalDateTime(reading.recordedAt)}</td>
                    <td>
                      <strong>{reading.deviceName}</strong>
                      <span>{reading.serialNumber}</span>
                    </td>
                    <td>{reading.metric}</td>
                    <td>
                      {reading.value}
                      {reading.unit ? ` ${reading.unit}` : ""}
                    </td>
                    <td>{reading.farmName || `Farm ${reading.farmId ?? "-"}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {!loading && readings.length > 0 ? (
          <div className="pagination-row">
            <button
              className="ghost-button"
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="button-icon" aria-hidden="true" />
              Previous
            </button>
            <span className="pagination-status">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="ghost-button"
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="button-icon" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}