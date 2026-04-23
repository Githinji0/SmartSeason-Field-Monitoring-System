import { Router } from "express";
import { login, me, register } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", authenticateToken, me);

export default authRouter;
