import { pool } from "../config/db.js";

export async function assignUserFarm(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const { farmId } = req.body;

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "valid userId is required" });
    }

    if (farmId !== null && farmId !== undefined && !Number.isInteger(Number(farmId))) {
      return res.status(400).json({ message: "farmId must be a number or null" });
    }

    await pool.execute(
      `UPDATE users
       SET farm_id = ?
       WHERE id = ?`,
      [farmId ? Number(farmId) : null, userId]
    );

    const [rows] = await pool.execute(
      `SELECT id, name, email, role, farm_id AS farmId, created_at AS createdAt
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: "user not found" });
    }

    return res.status(200).json({ data: rows[0] });
  } catch (error) {
    return next(error);
  }
}
