import { createDevice, listDevices } from "../services/device.service.js";

export async function getDevices(req, res, next) {
  try {
    const devices = await listDevices();
    res.status(200).json({ data: devices });
  } catch (error) {
    next(error);
  }
}

export async function postDevice(req, res, next) {
  try {
    const { name, serialNumber, farmId } = req.body;

    if (!name || !serialNumber) {
      return res.status(400).json({
        message: "name and serialNumber are required"
      });
    }

    const device = await createDevice({ name, serialNumber, farmId });
    res.status(201).json({ data: device });
  } catch (error) {
    next(error);
  }
}
