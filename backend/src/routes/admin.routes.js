import { Router } from "express";
import { assignUserFarm } from "../controllers/admin.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const adminRouter = Router();

adminRouter.patch("/users/:userId/farm", authenticateToken, authorizeRoles("admin"), assignUserFarm);

export default adminRouter;
