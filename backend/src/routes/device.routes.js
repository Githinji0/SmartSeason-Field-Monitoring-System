import { Router } from "express";
import { getDevices, postDevice } from "../controllers/device.controller.js";

const deviceRouter = Router();

deviceRouter.get("/", getDevices);
deviceRouter.post("/", postDevice);

export default deviceRouter;
