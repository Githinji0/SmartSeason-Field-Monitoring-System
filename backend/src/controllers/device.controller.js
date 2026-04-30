import { createDevice, listDevices, listDevicesForFarm } from "../services/device.service.js";

export async function getDevices(req, res, next) {
  try {
    const devices = req.user.role === "farmer" && req.user.farmId
      ? await listDevicesForFarm(req.user.farmId)
      : await listDevices();
    res.status(200).json({ data: devices });
  } catch (error) {
    next(error);
  }
}

export async function postDevice(req, res, next) {
  try {
    const { name, serialNumber, farmId } = req.body;

    if (!name || !serialNumber) {
      return res.status(400).json({ message: "name and serialNumber are required" });
    }

    // Coerce and validate farmId if provided (allow null/empty)
    let farmIdValue = null;
    if (farmId !== undefined && farmId !== null && String(farmId).trim() !== "") {
      const n = Number(farmId);
      if (!Number.isInteger(n) || n <= 0) {
        return res.status(400).json({ message: "farmId must be a positive integer or omitted" });
      }
      farmIdValue = n;
    }

    const device = await createDevice({ name, serialNumber, farmId: farmIdValue });
    res.status(201).json({ data: device });
  } catch (error) {
    // Log server-side error for diagnostics and send a friendly message
    console.error("postDevice error:", error?.message || error);
    if (error && error.code && (error.code === "ER_DUP_ENTRY")) {
      return res.status(400).json({ message: "A device with this serial number already exists." });
    }

    // Unknown server error
    next(error);
  }
}
