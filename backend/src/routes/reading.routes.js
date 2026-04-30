import { Router } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";
import { getReadings, postReading } from "../controllers/reading.controller.js";

const readingRouter = Router();

readingRouter.get("/", authenticateToken, authorizeRoles("farmer", "agronomist", "admin"), getReadings);
readingRouter.post("/", authenticateToken, authorizeRoles("agronomist", "admin"), postReading);

export default readingRouter;