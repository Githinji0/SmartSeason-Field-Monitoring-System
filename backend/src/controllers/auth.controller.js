import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { pool } from "../config/db.js";
import { createUser, findUserByEmail, findUserById, listUsers as getUsers } from "../services/user.service.js";

function buildToken(user) {
  return jwt.sign(
    {
      email: user.email,
      role: user.role,
      farmId: user.farmId
    },
    env.jwtSecret,
    {
      subject: String(user.id),
      expiresIn: env.jwtExpiresIn
    }
  );
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    farmId: user.farmId,
    createdAt: user.createdAt
  };
}

export async function register(req, res, next) {
  try {
    const { name, email, password, farmId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "name, email, and password are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "password must be at least 8 characters"
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await findUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ message: "email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      role: "farmer",
      farmId: farmId === undefined || farmId === null || farmId === "" ? null : Number(farmId)
    });

    const token = buildToken(user);

    return res.status(201).json({
      data: {
        user: sanitizeUser(user),
        token
      }
    });
  } catch (error) {
    return next(error);
  }
}

export async function listUsers(req, res, next) {
  try {
    const users = await getUsers();
    return res.status(200).json({ data: users });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "email and password are required"
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const token = buildToken(user);

    return res.status(200).json({
      data: {
        user: sanitizeUser(user),
        token
      }
    });
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    return res.status(200).json({ data: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function registerOwnFarm(req, res, next) {
  const connection = await pool.getConnection();
  let hasTransaction = false;

  try {
    const userId = Number.parseInt(String(req.user.id), 10);
    const { name, location } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "farm name is required" });
    }

    const currentUser = await findUserById(userId);

    if (!currentUser) {
      return res.status(404).json({ message: "user not found" });
    }

    if (currentUser.farmId) {
      return res.status(400).json({ message: "You already have an assigned farm" });
    }

    await connection.beginTransaction();
    hasTransaction = true;

    const [farmInsert] = await connection.execute(
      `INSERT INTO farms (name, location)
       VALUES (?, ?)`,
      [String(name).trim(), location && String(location).trim() ? String(location).trim() : null]
    );

    const farmId = farmInsert.insertId;

    await connection.execute(
      `UPDATE users
       SET farm_id = ?
       WHERE id = ?`,
      [farmId, userId]
    );

    const [userRows] = await connection.execute(
      `SELECT id, name, email, role, farm_id AS farmId, created_at AS createdAt
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId]
    );

    await connection.commit();
    hasTransaction = false;

    const updatedUser = userRows[0];
    const token = buildToken(updatedUser);

    return res.status(201).json({
      data: {
        farm: {
          id: farmId,
          name: String(name).trim(),
          location: location && String(location).trim() ? String(location).trim() : null
        },
        user: sanitizeUser(updatedUser),
        token
      }
    });
  } catch (error) {
    if (hasTransaction) {
      await connection.rollback();
    }
    return next(error);
  } finally {
    connection.release();
  }
}
