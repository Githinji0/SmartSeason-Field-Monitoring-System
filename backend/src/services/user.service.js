import { pool } from "../config/db.js";

export async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT id, name, email, password_hash AS passwordHash, role, farm_id AS farmId, created_at AS createdAt
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email]
  );

  return rows[0] || null;
}

export async function findUserById(id) {
  const [rows] = await pool.execute(
    `SELECT id, name, email, role, farm_id AS farmId, created_at AS createdAt
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

export async function createUser({ name, email, passwordHash, role = "farmer", farmId = null }) {
  const [result] = await pool.execute(
    `INSERT INTO users (name, email, password_hash, role, farm_id)
     VALUES (?, ?, ?, ?, ?)`,
    [name, email, passwordHash, role, farmId]
  );

  return findUserById(result.insertId);
}

export async function listUsers() {
  const [rows] = await pool.execute(
    `SELECT id, name, email, role, farm_id AS farmId, created_at AS createdAt
     FROM users
     ORDER BY created_at DESC`
  );

  return rows;
}
