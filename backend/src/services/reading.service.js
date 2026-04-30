import { pool } from "../config/db.js";

function buildReadingSelect(whereClauses) {
  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  return `
    SELECT
      r.id,
      r.device_id AS deviceId,
      d.name AS deviceName,
      d.serial_number AS serialNumber,
      d.farm_id AS farmId,
      r.metric,
      r.value,
      r.unit,
      r.recorded_at AS recordedAt,
      r.created_at AS createdAt
    FROM readings r
    INNER JOIN devices d ON d.id = r.device_id
    ${whereSql}
    ORDER BY r.recorded_at DESC, r.created_at DESC
    LIMIT ?
  `;
}

export async function createReading({ deviceId, metric, value, unit, recordedAt }) {
  const [result] = await pool.execute(
    `INSERT INTO readings (device_id, metric, value, unit, recorded_at)
     VALUES (?, ?, ?, ?, ?)`,
    [deviceId, metric, value, unit || null, recordedAt]
  );

  const [rows] = await pool.execute(
    `
      SELECT
        r.id,
        r.device_id AS deviceId,
        d.name AS deviceName,
        d.serial_number AS serialNumber,
        d.farm_id AS farmId,
        r.metric,
        r.value,
        r.unit,
        r.recorded_at AS recordedAt,
        r.created_at AS createdAt
      FROM readings r
      INNER JOIN devices d ON d.id = r.device_id
      WHERE r.id = ?
    `,
    [result.insertId]
  );

  return rows[0];
}

export async function listReadings({ deviceId, farmId, metric, since, until, limit = 100 }) {
  const whereClauses = [];
  const parameters = [];

  if (farmId !== null && farmId !== undefined) {
    whereClauses.push("d.farm_id = ?");
    parameters.push(farmId);
  }

  if (deviceId) {
    whereClauses.push("r.device_id = ?");
    parameters.push(deviceId);
  }

  if (metric) {
    whereClauses.push("r.metric = ?");
    parameters.push(metric);
  }

  if (since) {
    whereClauses.push("r.recorded_at >= ?");
    parameters.push(since);
  }

  if (until) {
    whereClauses.push("r.recorded_at <= ?");
    parameters.push(until);
  }

  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 500) : 100;
  parameters.push(safeLimit);

  const [rows] = await pool.execute(buildReadingSelect(whereClauses), parameters);
  return rows;
}