import { Router } from "express";
import { getDevices, postDevice } from "../controllers/device.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const deviceRouter = Router();

deviceRouter.get("/", authenticateToken, authorizeRoles("farmer", "agronomist", "admin"), getDevices);
deviceRouter.post("/", authenticateToken, authorizeRoles("agronomist", "admin"), postDevice);

export default deviceRouter;
