import { pool } from "../config/db.js";

export async function createDevice({ name, serialNumber, farmId }) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const normalizedFarmId = farmId === null || farmId === undefined ? null : Number(farmId);

    if (normalizedFarmId !== null) {
      await connection.execute(
        `INSERT IGNORE INTO farms (id, name, location)
         VALUES (?, ?, ?)`,
        [normalizedFarmId, `Farm ${normalizedFarmId}`, null]
      );
    }

    const [result] = await connection.execute(
      `INSERT INTO devices (name, serial_number, farm_id)
       VALUES (?, ?, ?)`,
      [name, serialNumber, normalizedFarmId]
    );

    const [rows] = await connection.execute(
      `SELECT id, name, serial_number AS serialNumber, farm_id AS farmId, created_at AS createdAt
       FROM devices
       WHERE id = ?`,
      [result.insertId]
    );

    await connection.commit();
    return rows[0];
  } catch (err) {
    await connection.rollback();
    console.error("createDevice db error:", err?.message || err);
    throw err;
  } finally {
    connection.release();
  }
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
