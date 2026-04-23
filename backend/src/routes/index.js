import { Router } from "express";
import healthRouter from "./health.routes.js";
import deviceRouter from "./device.routes.js";
import authRouter from "./auth.routes.js";
import { authenticateToken } from "../middleware/auth.js";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/devices", authenticateToken, deviceRouter);

export default apiRouter;
