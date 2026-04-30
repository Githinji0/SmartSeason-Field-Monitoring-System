import { Router } from "express";
import healthRouter from "./health.routes.js";
import deviceRouter from "./device.routes.js";
import authRouter from "./auth.routes.js";
import adminRouter from "./admin.routes.js";
import readingRouter from "./reading.routes.js";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/devices", deviceRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/readings", readingRouter);

export default apiRouter;
