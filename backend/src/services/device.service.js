import { pool } from "../config/db.js";

export async function createDevice({ name, serialNumber, farmId }) {
  const [result] = await pool.execute(
    `INSERT INTO devices (name, serial_number, farm_id)
     VALUES (?, ?, ?)`,
    [name, serialNumber, farmId || null]
  );

  const [rows] = await pool.execute(
    `SELECT id, name, serial_number AS serialNumber, farm_id AS farmId, created_at AS createdAt
     FROM devices
     WHERE id = ?`,
    [result.insertId]
  );

  return rows[0];
}

export async function listDevices() {
  const [rows] = await pool.execute(
    `SELECT id, name, serial_number AS serialNumber, farm_id AS farmId, created_at AS createdAt
     FROM devices
     ORDER BY created_at DESC`
  );

  return rows;
}

export async function listDevicesForFarm(farmId) {
  const [rows] = await pool.execute(
    `SELECT id, name, serial_number AS serialNumber, farm_id AS farmId, created_at AS createdAt
     FROM devices
     WHERE farm_id = ?
     ORDER BY created_at DESC`,
    [farmId]
  );

  return rows;
}
