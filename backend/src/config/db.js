import mysql from "mysql2/promise";
import { env } from "./env.js";

export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function checkDatabaseConnection() {
  const connection = await pool.getConnection();
  connection.release();
}

export async function ensureUserFarmAssignmentColumn() {
  const connection = await pool.getConnection();

  try {
    const [columnRows] = await connection.execute(
      `SELECT COUNT(*) AS columnCount
       FROM information_schema.columns
       WHERE table_schema = ?
         AND table_name = 'users'
         AND column_name = 'farm_id'`,
      [env.db.database]
    );

    if (!columnRows[0]?.columnCount) {
      await connection.execute(
        `ALTER TABLE users
         ADD COLUMN farm_id INT NULL AFTER role`
      );
    }

    const [constraintRows] = await connection.execute(
      `SELECT COUNT(*) AS constraintCount
       FROM information_schema.table_constraints
       WHERE table_schema = ?
         AND table_name = 'users'
         AND constraint_name = 'fk_users_farm'`,
      [env.db.database]
    );

    if (!constraintRows[0]?.constraintCount) {
      await connection.execute(
        `ALTER TABLE users
         ADD CONSTRAINT fk_users_farm
         FOREIGN KEY (farm_id)
         REFERENCES farms(id)
         ON DELETE SET NULL`
      );
    }
  } finally {
    connection.release();
  }
}
