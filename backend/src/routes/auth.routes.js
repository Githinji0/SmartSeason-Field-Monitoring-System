import { Router } from "express";
import { login, listUsers, me, register, registerOwnFarm } from "../controllers/auth.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/farm", authenticateToken, authorizeRoles("farmer"), registerOwnFarm);
authRouter.get("/me", authenticateToken, me);
authRouter.get("/users", authenticateToken, authorizeRoles("admin"), listUsers);

export default authRouter;
